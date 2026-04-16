using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Server.Infrastructure.Db;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    ILogger<DatabaseInitializer> logger)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            logger.LogInformation("Ensuring database tables are created...");

            // Checks if tables exist; creates them with columns/types if they don't.
            await dbContext.Database.EnsureCreatedAsync(cancellationToken);

            logger.LogInformation("Database initialization completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while creating the database tables: {Message}", ex.Message);

            // Re-throw if you want the application to stop starting up on failure
            throw;
        }
    }
}
