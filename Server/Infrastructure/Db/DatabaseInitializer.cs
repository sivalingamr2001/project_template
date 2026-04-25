using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Oracle.ManagedDataAccess.Client;
using Server.Domain.Entities;
using Server.Shared.Helpers;

namespace Server.Infrastructure.Db;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    PasswordHasher passwordHasher)
{
    // These must match the EXACT case seen in your database tool (lowercase)
    private readonly string[] _requiredTables =
    {
        "jan_employees",
        "jan_budgets",
        "jan_budget_templates",
        "jan_budget_categories",
        "jan_budget_items"
    };

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            // 1. Check and create schema if missing
            await EnsureSchemaExistsAsync(cancellationToken);

            // 2. Seed initial data
            await SeedDataAsync(cancellationToken);
        });
    }

    private async Task EnsureSchemaExistsAsync(CancellationToken cancellationToken)
    {
        var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();

        // Ensure physical database exists
        if (!await databaseCreator.ExistsAsync(cancellationToken))
        {
            Console.WriteLine("Database does not exist. Creating...");
            await databaseCreator.CreateAsync(cancellationToken);
        }

        // Identify which tables are actually missing
        var missingTables = await GetMissingTablesAsync(cancellationToken);

        if (missingTables.Any())
        {
            Console.WriteLine($"Missing tables detected: {string.Join(", ", missingTables)}");

            try
            {
                var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync(cancellationToken);
                if (pendingMigrations.Any())
                {
                    Console.WriteLine("Applying migrations...");
                    await dbContext.Database.MigrateAsync(cancellationToken);
                }
                else
                {
                    Console.WriteLine("No migrations found. Attempting direct table creation...");
                    await databaseCreator.CreateTablesAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                // Handle Oracle "Object already exists" error gracefully
                if (ex is OracleException ox && ox.Number == 955)
                    Console.WriteLine("Note: Some objects already existed in Oracle.");
                else
                    throw;
            }

            // Final verification check
            var stillMissing = await GetMissingTablesAsync(cancellationToken);
            if (stillMissing.Any())
            {
                throw new InvalidOperationException($"Database initialization failed. Tables still missing: {string.Join(", ", stillMissing)}");
            }
        }
        else
        {
            Console.WriteLine("✓ All required tables verified.");
        }
    }

    private async Task<List<string>> GetMissingTablesAsync(CancellationToken ct)
    {
        var missing = new List<string>();
        var connection = dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(ct);

        var provider = dbContext.Database.ProviderName;
        bool isOracle = provider?.Contains("Oracle") == true;

        foreach (var tableName in _requiredTables)
        {
            using var command = connection.CreateCommand();

            // Set parameter style based on provider
            string sqlParam = isOracle ? ":p0" : "@p0";
            string paramName = isOracle ? "p0" : "@p0";

            if (isOracle)
            {
                // Querying user_tables with exact case matching
                command.CommandText = $"SELECT COUNT(*) FROM user_tables WHERE table_name = {sqlParam}";
            }
            else if (dbContext.Database.IsSqlite())
            {
                command.CommandText = $"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name={sqlParam}";
            }
            else
            {
                command.CommandText = $"SELECT COUNT(*) FROM information_schema.tables WHERE table_name = {sqlParam}";
            }

            var p = command.CreateParameter();
            p.ParameterName = paramName;
            p.Value = tableName;
            command.Parameters.Add(p);

            var result = await command.ExecuteScalarAsync(ct);
            if (Convert.ToInt32(result) == 0)
            {
                missing.Add(tableName);
            }
        }

        return missing;
    }

    private async Task SeedDataAsync(CancellationToken cancellationToken)
    {
        try
        {
            // Don't seed if the main table is missing
            var missing = await GetMissingTablesAsync(cancellationToken);
            if (missing.Contains("jan_employees")) return;

            // Check if data exists - use CountAsync for Oracle compatibility
            // Oracle doesn't support True/False in SQL, so AnyAsync() generates invalid SQL
            var provider = dbContext.Database.ProviderName;
            bool hasData = provider?.Contains("Oracle") == true
                ? await dbContext.Employees.CountAsync(cancellationToken) > 0
                : await dbContext.Employees.AnyAsync(cancellationToken);

            if (!hasData)
            {
                Console.WriteLine("Seeding initial administrative data...");
                var (hash, salt) = passwordHasher.HashPassword("Jan@123");

                var admin = new EmployeeEntity
                {
                    EmployeeId = 1001,
                    Name = "Admin",
                    Email = "admin@janatics.co.in",
                    DepartmentId = 101,
                    DepartmentName = "IT",
                    Role = "Admin",
                    PasswordHash = hash,
                    PasswordSalt = salt
                };

                await dbContext.Employees.AddAsync(admin, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
                Console.WriteLine("Seeding completed.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Seeding failed - {ex.Message}");
        }
    }
}
