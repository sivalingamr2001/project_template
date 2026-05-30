using System.Text.Json;
using DataEngine.Abstractions;
using DataEngine.Model;
using DataEngine.Repository;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MySqlConnector;

namespace DataEngine.Services;

public class DynamicTransactionProcessor(
    ApplicationTableMetadataRepository metadataRepository,
    ITransactionValidator validator,
    IConfiguration configuration,
    ILogger<DynamicTransactionProcessor> logger) : IDynamicTransactionProcessor
{
    private readonly ApplicationTableMetadataRepository _metadataRepository = metadataRepository;
    private readonly ITransactionValidator _validator = validator;
    private readonly ILogger<DynamicTransactionProcessor> _logger = logger;
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("DefaultConnection string configuration target not found.");

    public async Task<TransactionResult> ProcessTransactionAsync(TransactionRequest request, CancellationToken cancellationToken = default)
    {
        var result = new TransactionResult { TransactionId = request.TransactionId, Success = false };

        if (string.IsNullOrWhiteSpace(request.TransactionEntityName))
        {
            result.Message = "Transaction execution rejected: TransactionEntityName cannot be blank.";
            return result;
        }

        try
        {
            var schema = await _metadataRepository.GetTableSchemaMetadataAsync(request.TransactionEntityName, cancellationToken);
            if (schema == null || schema.Count == 0)
            {
                result.Message = $"Metadata engine lookup failed for entity table target: {request.TransactionEntityName}";
                return result;
            }

            var validationResult = await _validator.ValidatePayloadAsync(request, schema, cancellationToken);
            if (!validationResult.IsValid)
            {
                result.Message = $"Validation Block Failure: {validationResult.FailureReason}";
                return result;
            }

            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken);
            await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

            try
            {
                if (request.DelProps.TryGetValue(request.TransactionEntityName, out var deleteRows))
                {
                    foreach (var row in deleteRows)
                    {
                        await ExecuteDeleteAsync(connection, transaction, request.TransactionEntityName, schema, row, cancellationToken);
                    }
                }

                if (request.RenProps.TryGetValue(request.TransactionEntityName, out var upsertRows))
                {
                    int index = 0;
                    foreach (var row in upsertRows)
                    {
                        var pkColumn = schema.FirstOrDefault(c => c.IsPrimaryKey);

                        // Safely extract the raw primary key even if wrapped inside a JsonElement container
                        object? rawPkValue = row.TryGetValue(pkColumn?.ColumnName ?? string.Empty, out var pkVal) ? GetRawValue(pkVal) : null;
                        bool isUpdate = pkColumn != null && rawPkValue != null && !string.IsNullOrEmpty(rawPkValue.ToString());

                        if (isUpdate)
                        {
                            await ExecuteUpdateAsync(connection, transaction, request.TransactionEntityName, schema, row, pkColumn!, cancellationToken);
                        }
                        else
                        {
                            long? newId = await ExecuteInsertAsync(connection, transaction, request.TransactionEntityName, schema, row, cancellationToken);
                            if (newId.HasValue && pkColumn != null)
                            {
                                result.Data[$"Inserted_{pkColumn.ColumnName}_{index}"] = newId.Value;
                            }
                        }
                        index++;
                    }
                }

                await transaction.CommitAsync(cancellationToken);

                result.Success = true;
                result.Message = "Pipeline process execution successfully verified and committed.";
                _logger.LogInformation("Transaction {TransactionId} committed for entity {Entity}", request.TransactionId, request.TransactionEntityName);
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(ex, "Database operation error crash during execution phase of: {TransactionId}", request.TransactionId);
                throw;
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Processing aborted: {ex.Message}";
            result.Exception = ex;
            return result;
        }
    }

    private async Task<long?> ExecuteInsertAsync(MySqlConnection conn, MySqlTransaction tx, string tableName, List<ColumnMetadata> schema, Dictionary<string, object> row, CancellationToken ct)
    {
        var columnsToInsert = new List<string>();
        var parameterNames = new List<string>();
        using var command = new MySqlCommand("", conn, tx);

        foreach (var col in schema)
        {
            if (col.IsAutoIncrement) continue;

            if (row.TryGetValue(col.ColumnName, out var value))
            {
                columnsToInsert.Add($"`{col.ColumnName}`");
                parameterNames.Add($"@{col.ColumnName}");

                // Scrub the value before appending it to the execution parameters dictionary
                command.Parameters.AddWithValue($"@{col.ColumnName}", GetRawValue(value) ?? DBNull.Value);
            }
        }

        string sql = $"INSERT INTO `{tableName}` ({string.Join(", ", columnsToInsert)}) VALUES ({string.Join(", ", parameterNames)}); SELECT LAST_INSERT_ID();";
        command.CommandText = sql;
        var res = await command.ExecuteScalarAsync(ct);
        return res != null && res != DBNull.Value ? Convert.ToInt64(res) : null;
    }

    private async Task ExecuteUpdateAsync(MySqlConnection conn, MySqlTransaction tx, string tableName, List<ColumnMetadata> schema, Dictionary<string, object> row, ColumnMetadata pkColumn, CancellationToken ct)
    {
        var updateFields = new List<string>();
        using var command = new MySqlCommand("", conn, tx);

        foreach (var col in schema)
        {
            if (col.IsPrimaryKey) continue;

            if (row.TryGetValue(col.ColumnName, out var value))
            {
                updateFields.Add($"`{col.ColumnName}` = @{col.ColumnName}");

                // Scrub the value before appending it to the execution parameters dictionary
                command.Parameters.AddWithValue($"@{col.ColumnName}", GetRawValue(value) ?? DBNull.Value);
            }
        }

        if (updateFields.Count == 0) return;

        string sql = $"UPDATE `{tableName}` SET {string.Join(", ", updateFields)} WHERE `{pkColumn.ColumnName}` = @{pkColumn.ColumnName};";
        command.CommandText = sql;

        object? cleanPkValue = GetRawValue(row[pkColumn.ColumnName]);
        command.Parameters.AddWithValue($"@{pkColumn.ColumnName}", cleanPkValue ?? DBNull.Value);

        await command.ExecuteNonQueryAsync(ct);
    }

    private async Task ExecuteDeleteAsync(MySqlConnection conn, MySqlTransaction tx, string tableName, List<ColumnMetadata> schema, Dictionary<string, object> row, CancellationToken ct)
    {
        var pkColumn = schema.First(c => c.IsPrimaryKey);
        string sql = $"DELETE FROM `{tableName}` WHERE `{pkColumn.ColumnName}` = @{pkColumn.ColumnName};";

        using var command = new MySqlCommand(sql, conn, tx);
        object? cleanPkValue = GetRawValue(row[pkColumn.ColumnName]);
        command.Parameters.AddWithValue($"@{pkColumn.ColumnName}", cleanPkValue ?? DBNull.Value);

        await command.ExecuteNonQueryAsync(ct);
    }

    /// <summary>
    /// Core data extraction utility. Extracts internal types out of standard System.Text.Json wrappers
    /// back into native C# runtime primitive variables that database drivers natively understand.
    /// </summary>
    private static object? GetRawValue(object? value)
    {
        if (value is JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.TryGetInt64(out long l) ? l : element.GetDecimal(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                _ => element.GetRawText() // Returns raw string layouts for objects/arrays fallback
            };
        }
        return value;
    }
}
