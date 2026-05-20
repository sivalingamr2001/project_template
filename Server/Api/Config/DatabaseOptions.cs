namespace Server.Api.Config;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string Provider { get; set; } = "Sqlite";
    public bool AutoMigrateOnStartup { get; set; } = true;
    public string SqliteConnectionString { get; set; } = "Data Source=file-access-portal.db";
    public string MySqlConnectionString { get; set; } = "server=localhost;port=3306;database=file_access_portal;user=root;password=change-me";
    public string MySqlConnectionString_local { get; set; } = "server=localhost;port=3306;database=dev;user=dev;password=dev123";
    public string MySqlConnectionString_Cmpl { get; set; } = string.Empty;
    public string MySqlServerVersion { get; set; } = "8.0.0-mysql";
}
