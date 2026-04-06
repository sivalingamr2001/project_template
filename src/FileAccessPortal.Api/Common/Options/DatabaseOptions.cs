namespace FileAccessPortal.Api.Common.Options;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";

    public string Provider { get; set; } = "Sqlite";
    public string SqliteConnectionString { get; set; } = "Data Source=file-access-portal.db";
    public string MySqlConnectionString { get; set; } = "server=localhost;port=3306;database=file_access_portal;user=root;password=change-me";
}
