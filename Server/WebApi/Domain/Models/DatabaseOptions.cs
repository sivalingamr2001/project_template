namespace WebApi.Domain.Models;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string Provider { get; set; } = "Sqlite";

    public bool AutoMigrateOnStartup { get; set; } = true;

    public string SqliteConnectionString { get; set; } = "Data Source=file-access-portal.db";

    public string MySqlConnectionString { get; set; } = string.Empty;

    public string MySqlConnectionString_Cmpl { get; set; } = string.Empty;

    public string MySqlConnectionString_Hod { get; set; } = string.Empty;

    public string MySqlServerVersion { get; set; } = "8.0.0-mysql";
}
