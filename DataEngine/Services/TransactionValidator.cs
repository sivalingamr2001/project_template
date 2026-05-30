using DataEngine.Abstractions;
using DataEngine.Model;
using System.Globalization;

namespace DataEngine.Services;

public class TransactionValidator : ITransactionValidator
{
    public Task<(bool IsValid, string FailureReason)> ValidatePayloadAsync(TransactionRequest request, List<ColumnMetadata> schema, CancellationToken cancellationToken = default)
    {
        // 1. Map columns for instant O(1) lookups
        var schemaMap = schema.ToDictionary(c => c.ColumnName.ToLowerInvariant());

        // 2. Validate Delete Payloads (Check PK structural existence)
        if (request.DelProps.TryGetValue(request.TransactionEntityName, out var deleteRows))
        {
            var pkColumn = schema.FirstOrDefault(c => c.IsPrimaryKey);
            if (pkColumn == null)
            {
                return Task.FromResult((false, $"Delete requested but no primary key defined on table '{request.TransactionEntityName}'"));
            }

            foreach (var row in deleteRows)
            {
                if (!row.TryGetValue(pkColumn.ColumnName, out var pkValue) || pkValue == null)
                {
                    return Task.FromResult((false, $"Delete operation payload missing targeted primary key field: '{pkColumn.ColumnName}'"));
                }
            }
        }

        // 3. Validate Upsert Payloads (Type Matrix Compliance Match)
        if (request.RenProps.TryGetValue(request.TransactionEntityName, out var upsertRows))
        {
            foreach (var row in upsertRows)
            {
                foreach (var field in row)
                {
                    if (!schemaMap.TryGetValue(field.Key.ToLowerInvariant(), out var columnMetadata))
                    {
                        // Safe Guard: Blocks incoming columns that do not exist in the physical database
                        return Task.FromResult((false, $"Column '{field.Key}' does not exist on table '{request.TransactionEntityName}'"));
                    }

                    if (field.Value == null || field.Value is DBNull)
                    {
                        if (!columnMetadata.IsNullable && !columnMetadata.IsAutoIncrement && !columnMetadata.HasDefaultValue)
                        {
                            return Task.FromResult((false, $"Column '{field.Key}' is non-nullable and cannot accept Null data inputs."));
                        }
                        continue;
                    }

                    // 4. Evaluate Payload Type Matrix Compatibilities
                    if (!IsValidTypeMapping(field.Value, columnMetadata))
                    {
                        return Task.FromResult((false, $"Type mismatch for column '{field.Key}'. Received payload type '{field.Value.GetType().Name}' which is incompatible with database type reference '{columnMetadata.DataType}'"));
                    }
                }
            }
        }

        return Task.FromResult((true, string.Empty));
    }

    private bool IsValidTypeMapping(object value, ColumnMetadata column)
    {
        string rawValue = value.ToString() ?? string.Empty;

        return column.DataType.ToLowerInvariant() switch
        {
            "int" or "integer" or "bigint" or "smallint" or "tinyint" =>
                long.TryParse(rawValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out _),

            "decimal" or "numeric" or "double" or "float" =>
                decimal.TryParse(rawValue, NumberStyles.Float, CultureInfo.InvariantCulture, out _),

            "datetime" or "timestamp" or "date" =>
                DateTime.TryParse(rawValue, CultureInfo.InvariantCulture, DateTimeStyles.None, out _),

            "bit" or "boolean" =>
                bool.TryParse(rawValue, out _) || rawValue == "1" || rawValue == "0",

            "varchar" or "char" or "text" or "longtext" or "mediumtext" =>
                column.MaxCharacterLength == null || rawValue.Length <= column.MaxCharacterLength,

            _ => true // Fallback trace for custom binary blobs or special expressions
        };
    }
}
