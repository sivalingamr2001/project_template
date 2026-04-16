using Server.Infrastructure.Db;

namespace Server.Api.Config;

public static class WebApplicationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();

        var initializeOnStartup = configuration.GetValue("Database:InitializeOnStartup", environment.IsDevelopment());
        if (!initializeOnStartup)
        {
            return;
        }

        var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
        await initializer.InitializeAsync();
    }
}
