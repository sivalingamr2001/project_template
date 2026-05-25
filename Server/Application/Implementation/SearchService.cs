using Application.Contracts;
using Application.DTOs.Request;
using Dapper;
using Infrastructure.Persistence.Oracle; // Added namespace for OracleService
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Oracle.ManagedDataAccess.Client;

namespace Application.Implementation;

public class SearchService : ISearchService
{
    private readonly string _connectionString;
    private readonly OracleService _oracleService; // Added dependency field
    private readonly ILogger<SearchService> _logger;

    public SearchService(
        IConfiguration configuration,
        ILogger<SearchService> logger,
        OracleService oracleService) // Injected OracleService
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _oracleService = oracleService ?? throw new ArgumentNullException(nameof(oracleService));

        _connectionString = configuration.GetConnectionString("PLMConnectionString")
            ?? throw new InvalidOperationException("The connection string 'PLMConnectionString' was not found in configuration.");
    }

    public async Task<IEnumerable<ProjectHeaderDto>> SearchProjectsAsync(string query)
    {
        string wildcardQuery = $"%{query}%";

        const string sql = @"
            SELECT 
                product_no AS ProductNo, 
                product_revision AS Revision, 
                projectnumber AS ProjectNumber, 
                projectname AS ProjectName
            FROM jan_plm_project_header_v
            WHERE UPPER(product_no) LIKE UPPER(:searchQuery) 
               OR UPPER(projectname) LIKE UPPER(:searchQuery)
            FETCH FIRST 1 ROWS ONLY";

        try
        {
            await using var connection = new OracleConnection(_connectionString);
            return await connection.QueryAsync<ProjectHeaderDto>(sql, new { searchQuery = wildcardQuery });
        }
        catch (OracleException ex)
        {
            _logger.LogError(ex, "Oracle query execution failed during project search.");
            throw;
        }
    }

    public async Task<IEnumerable<PartDetailDto>> SearchPartsAsync(string query)
    {
        // Resolved connection string using the injected OracleService instance
        var connectionStr = _oracleService.GetConnectionString();

        string wildcardQuery = $"%{query}%";

        const string sql = @"
            SELECT DISTINCT
                a.SEGMENT1 AS PartNumber,
                a.DESCRIPTION AS PartName,
                b.REVISION AS Rev
            FROM mtl_system_items a
            INNER JOIN mtl_item_revisions b ON a.INVENTORY_ITEM_ID = b.INVENTORY_ITEM_ID
            WHERE UPPER(a.SEGMENT1) LIKE UPPER(:searchQuery)
               OR UPPER(a.DESCRIPTION) LIKE UPPER(:searchQuery)";
        try
        {
            await using var connection = new OracleConnection(connectionStr);
            return await connection.QueryAsync<PartDetailDto>(sql, new { searchQuery = wildcardQuery });
        }
        catch (OracleException ex)
        {
            _logger.LogError(ex, "Oracle query execution failed during part search.");
            throw;
        }
    }
}
