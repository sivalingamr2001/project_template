namespace Server.Shared.Helpers;

public class ConnectionStrings(IConfiguration configuration, ILogger<ConnectionStrings> logger)
{
    public string Cmpl => GetConnectionString("MySqlConnectionString_Cmpl", "Database:MySqlConnectionString_Cmpl", "CMPL");
    public string HodMaster => GetConnectionString("MySqlConnectionString_Hod", "Database:MySqlConnectionString_Hod", "HOD Master");

    private string GetConnectionString(string standardKey, string fallbackKey, string contextName)
    {
        var connectionString = configuration.GetConnectionString(standardKey)
                               ?? configuration[fallbackKey];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            logger.LogError("{Context} connection string is not configured", contextName);
            throw new InvalidOperationException($"{contextName} connection string is missing.");
        }

        return connectionString;
    }
}
