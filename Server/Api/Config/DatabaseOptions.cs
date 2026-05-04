namespace Server.Api.Config;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string Provider { get; set; } = "Sqlite";
    public bool AutoMigrateOnStartup { get; set; } = true;
    public string SqliteConnectionString { get; set; } = "Data Source=file-access-portal.db";
    public string MySqlConnectionString { get; set; } = "server=localhost;port=3306;database=file_access_portal;user=root;password=change-me";

    // Matches appsettings.json key: "MySqlConnectionString_local"
    public string MySqlConnectionString_local { get; set; } = "server=localhost;port=3306;database=dev;user=dev;password=dev123";

    // Connection string used to validate users from the JAN complaint/common login database
    public string MySqlConnectionString_Cmpl { get; set; } = string.Empty;

    // Used to avoid ServerVersion.AutoDetect (which opens a DB connection during startup).
    // Example values: "8.0.36-mysql", "10.11.6-mariadb".
    public string MySqlServerVersion { get; set; } = "8.0.0-mysql";
}
