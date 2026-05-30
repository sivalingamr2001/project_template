using DataEngine.Abstractions;
using DataEngine.Model;
using MySqlConnector;
using System.Data;
using System.Text;
using System.Text.Json;

namespace DataEngine.Services;

public class DynamicReadEngine(IQueryValidator validator) : IDynamicReadEngine
{
    private readonly IQueryValidator _validator = validator;

    public async Task<FetchResult> ExecuteQueryAsync(FetchConfig config, string connectionString, CancellationToken cancellationToken = default)
    {
        var result = new FetchResult { Success = false };

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            result.Message = "Targeted connection string argument mapping missing.";
            return result;
        }

        // 1. Structural Payload Verification Check
        var validation = _validator.ValidateQueryConfig(config);
        if (!validation.IsValid)
        {
            result.Message = $"Validation Block Failure: {validation.FailureReason}";
            return result;
        }

        using var command = new MySqlCommand();
        try
        {
            string baseSql = config.QueryText!;

            // 2. Safely Unpack Custom Named Parameters Input Collections
            if (config.InputParameters.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in config.InputParameters.EnumerateObject())
                {
                    command.Parameters.AddWithValue($"@{prop.Name}", GetRawValue(prop.Value) ?? DBNull.Value);
                }
            }

            var queryBuilder = new StringBuilder(baseSql);
            int paramCounter = 0;

            // 3. Inject Filter Conditions Matrix Structures
            if (config.EnableServerSideFiltering && config.FilterConditions != null)
            {
                bool hasWhereAlready = baseSql.Contains("WHERE", StringComparison.OrdinalIgnoreCase);

                foreach (var filter in config.FilterConditions)
                {
                    if (string.IsNullOrWhiteSpace(filter.Field)) continue;

                    string cleanField = filter.Field.Replace("`", "");
                    queryBuilder.Append(hasWhereAlready ? " AND " : " WHERE ");
                    hasWhereAlready = true;

                    string paramName = $"@f_p_{paramCounter++}";
                    object? cleanValue = GetRawValue(filter.Value);

                    queryBuilder.Append(filter.Operator.ToLowerInvariant() switch
                    {
                        "eq" => $" `{cleanField}` = {paramName} ",
                        "neq" => $" `{cleanField}` != {paramName} ",
                        "gt" => $" `{cleanField}` > {paramName} ",
                        "lt" => $" `{cleanField}` < {paramName} ",
                        "gte" => $" `{cleanField}` >= {paramName} ",
                        "lte" => $" `{cleanField}` <= {paramName} ",
                        "contains" => $" `{cleanField}` LIKE {paramName} ",
                        "startswith" => $" `{cleanField}` LIKE {paramName} ",
                        "endswith" => $" `{cleanField}` LIKE {paramName} ",
                        _ => $" `{cleanField}` = {paramName} "
                    });

                    if (filter.Operator.Equals("contains", StringComparison.OrdinalIgnoreCase)) cleanValue = $"%{cleanValue}%";
                    else if (filter.Operator.Equals("startswith", StringComparison.OrdinalIgnoreCase)) cleanValue = $"{cleanValue}%";
                    else if (filter.Operator.Equals("endswith", StringComparison.OrdinalIgnoreCase)) cleanValue = $"%{cleanValue}";

                    command.Parameters.AddWithValue(paramName, cleanValue ?? DBNull.Value);
                }
            }

            // 4. Inject Order Sorter Blocks
            if (config.EnableServerSideSorting && !string.IsNullOrWhiteSpace(config.SortField))
            {
                string cleanSort = config.SortField.Replace("`", "");
                string dir = config.SortDirection.ToLowerInvariant() == "desc" ? "DESC" : "ASC";
                queryBuilder.Append($" ORDER BY `{cleanSort}` {dir}");
            }

            // 5. Inject Pagination Limits Windows
            int offset = (Math.Max(1, config.PageNumber) - 1) * config.Count;
            queryBuilder.Append(" LIMIT @l_offset, @l_count;");

            command.Parameters.AddWithValue("@l_offset", offset);
            command.Parameters.AddWithValue("@l_count", config.Count);

            // 6. Connect and Stream Rows Back
            await using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);

            command.Connection = connection;
            command.CommandText = queryBuilder.ToString();

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                var row = new Dictionary<string, object?>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                }
                result.Rows.Add(row);
            }

            result.Success = true;
            result.TotalCount = result.Rows.Count;
            result.Message = "Success";
            return result;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = ex.Message;
            return result;
        }
    }

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
                _ => element.GetRawText()
            };
        }
        return value;
    }
}
