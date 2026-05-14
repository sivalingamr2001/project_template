using Dapper;
using MySqlConnector;
using Server.Features.Employees;

namespace Server.Features.HOD;

public class HODService
{
    private readonly IConfiguration _configuration;

    public HODService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<List<HodResponse>> GetHodAsync(GetEmployeesQuery query, IConfiguration configuration, CancellationToken cancellationToken)
    {
        ValidateProvider();

        var hodConnectionString = GetConnectionString("MySqlConnectionString_HOD");
        var cmplConnectionString = GetConnectionString("MySqlConnectionString_Cmpl");

        const string hodSql = @"
            SELECT 
                id AS EmployeeId, 
                hodname AS Name, 
                Email_ID AS Email, 
                Mob_no AS PhoneNumber
            FROM it_inventory_db_new.hod_master
            WHERE deleted = 0";

        // Querying your exact compliance columns mapped to the HodResponse properties
        const string employeeSql = @"
            SELECT 
                CMPL_USER_ID AS EmployeeId, 
                CMPL_USER_NAME AS Name, 
                CMPL_USER_KEY AS Email, 
                MOB_NO AS PhoneNumber
            FROM compliance_db.user_master
            WHERE deleted_flag = 0";

        try
        {
            using var hodConnection = new MySqlConnection(hodConnectionString);
            var hodResults = await hodConnection.QueryAsync<HodResponse>(
                new CommandDefinition(hodSql, cancellationToken: cancellationToken)
            );

            using var cmplConnection = new MySqlConnection(cmplConnectionString);
            var empResults = await cmplConnection.QueryAsync<HodResponse>(
                new CommandDefinition(employeeSql, cancellationToken: cancellationToken)
            );

            var combinedList = hodResults.ToList();
            combinedList.AddRange(empResults);

            return combinedList;
        }
        catch (MySqlException ex)
        {
            throw new Exception("A database error occurred while fetching records.", ex);
        }
    }

    private void ValidateProvider()
    {
        var provider = _configuration["Database:Provider"];
        if (provider != "MySql")
        {
            throw new InvalidOperationException($"Unsupported database provider: {provider}");
        }
    }

    private string GetConnectionString(string key)
    {
        var connectionString = _configuration.GetConnectionString(key) ?? _configuration[$"Database:{key}"];

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new ArgumentNullException(key, $"MySQL connection string '{key}' is missing.");
        }

        return connectionString;
    }
}
