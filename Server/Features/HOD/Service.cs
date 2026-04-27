using Dapper;
using MySqlConnector;
using Server.Features.Employees;

namespace Server.Features.HOD;

public class HODService
{
    public async Task<List<HodResponse>> GetHodAsync(GetEmployeesQuery query, IConfiguration configuration, CancellationToken cancellationToken)
    { 
        var provider = configuration["Database:Provider"];
        if (provider != "MySql")
        {
            throw new InvalidOperationException($"Unsupported database provider: {provider}");
        }

        var connectionString = configuration.GetConnectionString("MySqlConnectionString_HOD")
                               ?? configuration["Database:MySqlConnectionString_HOD"];

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new ArgumentNullException(nameof(connectionString), "MySQL connection string is missing.");
        }

        const string sql = @"
        SELECT 
            id AS EmployeeId, 
            hodname AS FirstName, 
            Email_ID AS Email, 
            Mob_no AS PhoneNumber
        FROM it_inventory_db_new.hod_master
        WHERE deleted = 0";

        try
        {
            using var connection = new MySqlConnection(connectionString);

            var results = await connection.QueryAsync<HodResponse>(
                new CommandDefinition(sql, cancellationToken: cancellationToken)
            );

            return results.ToList();
        }
        catch (MySqlException ex)
        {
            throw new Exception("A database error occurred while fetching HOD records.", ex);
        }
    }
}
