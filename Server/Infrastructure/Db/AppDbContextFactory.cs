using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Pomelo.EntityFrameworkCore.MySql;
using Server.Api.Config;

namespace Server.Infrastructure.Db;

// Used by `dotnet ef` at design-time so it doesn't execute API startup code.
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var currentDir = Directory.GetCurrentDirectory();
        var appSettingsCandidates = new[]
        {
            Path.Combine(currentDir, "appsettings.json"),
            Path.Combine(currentDir, "Server", "appsettings.json"),
        };

        var appSettingsPath = appSettingsCandidates.FirstOrDefault(File.Exists);
        var basePath = appSettingsPath is null
            ? currentDir
            : Path.GetDirectoryName(appSettingsPath) ?? currentDir;

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName).Get<DatabaseOptions>()
            ?? new DatabaseOptions();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        var serverVersion = ServerVersion.Parse(databaseOptions.MySqlServerVersion);

        if (string.Equals(databaseOptions.Provider, "MySql", StringComparison.OrdinalIgnoreCase))
        {
            optionsBuilder.UseMySql(databaseOptions.MySqlConnectionString, serverVersion);
        }
        else if (string.Equals(databaseOptions.Provider, "local_mysql", StringComparison.OrdinalIgnoreCase))
        {
            optionsBuilder.UseMySql(databaseOptions.MySqlConnectionString_local, serverVersion);
        }
        else
        {
            optionsBuilder.UseSqlite(databaseOptions.SqliteConnectionString);
        }

        return new AppDbContext(optionsBuilder.Options);
    }
}
