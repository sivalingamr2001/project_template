using DataEngine.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MySqlConnector;

namespace DataEngine.Repository;

public class ApplicationTableMetadataRepository(IConfiguration configuration, ILogger<ApplicationTableMetadataRepository> logger)
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection string not found");
    private readonly ILogger<ApplicationTableMetadataRepository> _logger = logger;

    public async Task<List<TableMetadata>> GetTableSchemaMetadataAsync(string entityName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(entityName))
        {
            throw new ArgumentException("Entity name cannot be null or empty.", nameof(entityName));
        }

        try
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync(cancellationToken);

            // Complete query covering all 100% requirements for dynamic CRUD generation
            var query = @"
                SELECT 
                    COLUMN_NAME, 
                    DATA_TYPE, 
                    IS_NULLABLE, 
                    COLUMN_KEY,
                    EXTRA,
                    CHARACTER_MAXIMUM_LENGTH,
                    COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'jan_itaccessreq_db' 
                  AND LOWER(TABLE_NAME) = LOWER(@entityName)
                ORDER BY ORDINAL_POSITION";

            await using var command = new MySqlCommand(query, connection);
            command.Parameters.AddWithValue("@entityName", entityName);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);
            var columns = new List<TableMetadata>();

            while (await reader.ReadAsync(cancellationToken))
            {
                columns.Add(new TableMetadata
                {
                    ColumnName = reader.GetString(0),
                    DataType = reader.GetString(1),
                    IsNullable = reader.GetString(2) == "YES",
                    IsPrimaryKey = reader.GetString(3) == "PRI",
                    IsAutoIncrement = !reader.IsDBNull(4) && reader.GetString(4).Contains("auto_increment", StringComparison.OrdinalIgnoreCase),
                    MaxCharacterLength = reader.IsDBNull(5) ? null : reader.GetInt64(5),
                    HasDefaultValue = !reader.IsDBNull(6),
                    DefaultValue = reader.IsDBNull(6) ? null : reader.GetString(6)
                });
            }

            if (columns.Count == 0)
            {
                _logger.LogWarning("No structural metadata found. Table may not exist in 'jan_itaccessreq_db': {EntityName}", entityName);
            }

            return columns;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving schema metadata for table: {EntityName}", entityName);
            throw;
        }
    }
}
