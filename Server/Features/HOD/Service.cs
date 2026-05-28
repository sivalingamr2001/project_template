using Dapper;
using MySqlConnector;
using Server.Features.Employees;
using Server.Shared.Helpers;

namespace Server.Features.HOD;

public class HODService(ConnectionStrings connectionStrings)
{
    public async Task<List<HodResponse>> GetHodAsync(
        GetEmployeesQuery query,
        CancellationToken cancellationToken)
    {
        try
        {
            using var connection = new MySqlConnection(connectionStrings.HodMaster);

            var results = await connection.QueryAsync<HodResponse>(
                new CommandDefinition(Queries.GetHodData, cancellationToken: cancellationToken)
            );

            return [.. results];
        }
        catch (MySqlException ex)
        {
            throw new InvalidOperationException("A database error occurred while fetching HOD records.", ex);
        }
    }

    public async Task<List<HodResponse>> SearchHodAsync(
        string searchTerm,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return [];
        }

        var formattedSearch = $"%{searchTerm.Trim()}%";
        var finalResults = new List<HodResponse>();

        try
        {
            // 1. Establish database connection using your helper string
            using var connection = new MySqlConnection(connectionStrings.HodMaster);

            // 2. Query from the primary HOD Master table
            var hodMasterResults = await connection.QueryAsync<HodResponse>(
                new CommandDefinition(
                    Queries.SearchHodMasterQuery,
                    new { SearchTerm = formattedSearch },
                    cancellationToken: cancellationToken)
            );
            finalResults.AddRange(hodMasterResults);

            // 3. Query from the secondary CMPL Complaint Login table
            var cmplLoginResults = await connection.QueryAsync<HodResponse>(
                new CommandDefinition(
                    Queries.SearchCmplLoginQuery,
                    new { SearchTerm = formattedSearch },
                    cancellationToken: cancellationToken)
            );
            finalResults.AddRange(cmplLoginResults);

            // 4. Return combined records gathered from both tables
            return finalResults;
        }
        catch (MySqlException ex)
        {
            throw new InvalidOperationException("A database error occurred while searching across HOD master and employee tables.", ex);
        }
    }
}
