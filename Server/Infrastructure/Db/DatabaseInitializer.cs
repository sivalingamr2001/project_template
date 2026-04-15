using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Server.Domain.Entities;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;
using System.Data;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    IConfiguration configuration)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        var isSqlite = dbContext.Database.ProviderName?.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) == true;
        var isMySql = dbContext.Database.ProviderName?.Contains("MySql", StringComparison.OrdinalIgnoreCase) == true;
        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var configuredProvider = configuration.GetSection("Database").GetValue<string>("Provider") ?? string.Empty;
        var isLocalMySql = string.Equals(configuredProvider, "local_mysql", StringComparison.OrdinalIgnoreCase);
        var recreateOnStartup = configuration.GetSection("Database").GetValue<bool>("MySqlRecreateOnStartup");

        // Create schema if missing.
        // Note: this repo's migrations are SQLite-oriented; for MySQL dev, use EnsureCreated to avoid
        // provider-specific migration annotations causing incorrect DDL.
        if (isMySql)
        {
            await dbContext.Database.EnsureCreatedAsync(cancellationToken);

            // EnsureCreated only runs when the database is created. If the DB already exists but is missing
            // tables, optionally recreate it (local dev only).
            if (isLocalMySql
                && recreateOnStartup
                && string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase))
            {
                var requiredTables = new[]
                {
                    "jan_portal_users",
                    "jan_accessrequest",
                    "jan_accessitems",
                    "jan_accessapproval",
                    "jan_accessreqaudit",
                };

                var anyMissing = false;
                foreach (var table in requiredTables)
                {
                    if (!await MySqlTableExistsAsync(table, cancellationToken))
                    {
                        anyMissing = true;
                        break;
                    }
                }

                if (anyMissing)
                {
                    await dbContext.Database.EnsureDeletedAsync(cancellationToken);
                    await dbContext.Database.EnsureCreatedAsync(cancellationToken);
                }
            }
        }
        else
        {
            // MigrateAsync handles creating the database and all tables defined in migrations
            await dbContext.Database.MigrateAsync(cancellationToken);
        }

        // For local development on SQLite, keep data minimal and predictable:
        // - Ensure a single Admin user exists
        // - Remove any other employees (including accidentally seeded CSV data)
        if (isSqlite && string.Equals(environmentName, "Development", StringComparison.OrdinalIgnoreCase))
        {
            await ResetEmployeesToAdminOnlyAsync(cancellationToken);
            return;
        }

        // For other environments/providers: seed Admin only when table is empty (non-destructive).
        if (await dbContext.Employees.AnyAsync(cancellationToken))
        {
            return;
        }

        await SeedAdminAsync(cancellationToken);
    }

    private async Task<bool> MySqlTableExistsAsync(string tableName, CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();
        var shouldClose = false;

        if (connection.State != ConnectionState.Open)
        {
            await dbContext.Database.OpenConnectionAsync(cancellationToken);
            shouldClose = true;
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText =
                "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = @name LIMIT 1;";

            var parameter = command.CreateParameter();
            parameter.ParameterName = "@name";
            parameter.Value = tableName;
            command.Parameters.Add(parameter);

            var result = await command.ExecuteScalarAsync(cancellationToken);
            return result is not null;
        }
        finally
        {
            if (shouldClose)
            {
                await dbContext.Database.CloseConnectionAsync();
            }
        }
    }

    private async Task ResetEmployeesToAdminOnlyAsync(CancellationToken cancellationToken)
    {
        const string adminUserName = "ADMIN";

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var adminCandidates = await dbContext.Employees
            .Where(employee => employee.UserName.ToUpper() == adminUserName)
            .OrderBy(employee => employee.EmployeeId)
            .ToListAsync(cancellationToken);

        var admin = adminCandidates.FirstOrDefault();
        if (admin is null)
        {
            admin = CreateAdminEmployee();
            await dbContext.Employees.AddAsync(admin, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        await dbContext.Employees
            .Where(employee => employee.EmployeeId != admin.EmployeeId)
            .ExecuteDeleteAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);
    }

    private async Task SeedAdminAsync(CancellationToken cancellationToken)
    {
        await dbContext.Employees.AddAsync(CreateAdminEmployee(), cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private EmployeeEntity CreateAdminEmployee()
    {
        var initialPassword = Environment.GetEnvironmentVariable("DEV_ADMIN_PASSWORD");
        if (string.IsNullOrWhiteSpace(initialPassword))
        {
            initialPassword = "JANADMIN";
        }

        var deptId = 101;
        var deptName = DepartmentCatalog.TryGetName(deptId) ?? string.Empty;
        var isMySql = dbContext.Database.ProviderName?.Contains("MySql", StringComparison.OrdinalIgnoreCase) == true;

        return new EmployeeEntity
        {
            // MySQL can be configured without AUTO_INCREMENT on legacy schemas; use an explicit key
            // for the initial seed to avoid "doesn't have a default value" errors.
            EmployeeId = isMySql ? 1 : 0,
            UserId = 0,
            FirstName = string.Empty,
            LastName = string.Empty,
            UserName = "ADMIN",
            Password = initialPassword,
            Email = string.Empty,
            Mobile = string.Empty,
            DeptId = deptId,
            DeptName = deptName,
            Location = string.Empty,
            UserRole = RoleNames.Admin,
            HodId = null,
            HodName = string.Empty,
            HodEmail = string.Empty,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = "0",
            UpdatedOn = DateTime.UtcNow,
            ModifiedBy = null,
        };
    }
}
