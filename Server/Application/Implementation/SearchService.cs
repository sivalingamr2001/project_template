using Application.Contracts;
using Application.DTOs.Request;
using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Oracle.ManagedDataAccess.Client;

namespace Application.Implementation;

public class SearchService : ISearchService
{
    private readonly string _connectionString;
    private readonly ILogger<SearchService> _logger;

    public SearchService(IConfiguration configuration, ILogger<SearchService> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _connectionString = configuration.GetConnectionString("PLMConnectionString")
            ?? throw new InvalidOperationException("The connection string 'PLMConnectionString' was not found in configuration.");
    }

    public async Task<IEnumerable<T>> SearchAsync<T>(string query)
    {
        string wildcardQuery = $"%{query}%";

        string sql = typeof(T) == typeof(ProjectHeaderDto)
            ? @"SELECT 
                    product_no AS ProductNo, 
                    product_revision AS Revision, 
                    projectnumber AS ProjectNumber, 
                    projectname AS ProjectName
                FROM jan_plm_project_header_v
                WHERE UPPER(product_no) LIKE UPPER(:searchQuery) OR UPPER(projectname) LIKE UPPER(:searchQuery)
                FETCH FIRST 1 ROWS ONLY"
            : typeof(T) == typeof(PartDetailDto)
            ? @"SELECT 
                    part_number AS PartNumber, 
                    part_name AS PartName, 
                    parttype AS PartType, 
                    latest_rev AS Rev
                FROM jan_plm_part_detail_v
                WHERE UPPER(part_number) LIKE UPPER(:searchQuery) OR UPPER(part_name) LIKE UPPER(:searchQuery)
                FETCH FIRST 1 ROWS ONLY"
            : throw new NotSupportedException($"Search mapping is not implemented for target type {typeof(T).Name}");

        try
        {
            await using var connection = new OracleConnection(_connectionString);
            var parameters = new { searchQuery = wildcardQuery };

            return await connection.QueryAsync<T>(sql, parameters);
        }
        catch (OracleException ex)
        {
            _logger.LogError(ex, "Dapper query execution failed for target DTO type {Type}", typeof(T).Name);
            throw;
        }
    }
}
