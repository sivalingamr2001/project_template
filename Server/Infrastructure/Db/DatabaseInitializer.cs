using System.Data;
using Microsoft.Data.Sqlite;
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
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        // Using an execution strategy handles transient connection failures (common in Cloud DBs)
        var strategy = dbContext.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            // 1. Ensure Database and Tables exist
            await EnsureSchemaExistsAsync(cancellationToken);

            // 2. Controlled Seeding
            await SeedDataAsync(cancellationToken);
        });
    }

    private async Task EnsureSchemaExistsAsync(CancellationToken cancellationToken)
    {
        var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();

        // Check if the physical database exists (creates it if missing)
        if (!await databaseCreator.ExistsAsync(cancellationToken))
        {
            await databaseCreator.CreateAsync(cancellationToken);
        }

        // Check if our specific tables exist. If not, generate them from the Model.
        // We use "Employees" as our "canary" table.
        if (!await AnyTableExistsAsync(cancellationToken))
        {
            try
            {
                // This reads your DbContext and generates the CREATE TABLE scripts
                // specifically for the provider currently in use.
                await databaseCreator.CreateTablesAsync(cancellationToken);
            }
            catch (OracleException ex) when (ex.Number == 955)
            {
                // ORA-00955 means an Oracle object already exists. When using Oracle,
                // ignore duplicate object creation failures during startup schema creation.
            }
            catch (SqliteException ex) when (ex.SqliteErrorCode == 1)
            {
                // SQLite Error 1: table already exists. Ignore duplicate table creation.
            }
        }
    }

    private async Task SeedDataAsync(CancellationToken cancellationToken)
    {
        // Check if table is empty before seeding.
        // Oracle provider may generate invalid SQL for AnyAsync(), so use CountAsync()
        // only for Oracle and preserve AnyAsync() elsewhere.
        var provider = dbContext.Database.ProviderName;
        bool hasData = provider?.Contains("Oracle") == true
            ? await dbContext.Employees.CountAsync(cancellationToken) > 0
            : await dbContext.Employees.AnyAsync(cancellationToken);

        if (!hasData)
        {
            var (hash, salt) = passwordHasher.HashPassword("0000");

            var employees = new List<EmployeeEntity>
            {
                new() {
                    EmployeeId = 1001,
                    Name = "Anitha",
                    Email = "anitha@corp.local",
                    DepartmentId = 10,
                    DepartmentName = "Finance",
                    Role = "User",
                    PasswordHash = hash,
                    PasswordSalt = salt
                },
                new() {
                    EmployeeId = 2001,
                    Name = "Rahul",
                    Email = "rahul@corp.local",
                    DepartmentId = 10,
                    DepartmentName = "Finance",
                    Role = "Hod",
                    PasswordHash = hash,
                    PasswordSalt = salt
                },
            };

            await dbContext.Employees.AddRangeAsync(employees, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<bool> AnyTableExistsAsync(CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();

        // Ensure connection is open
        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync(cancellationToken);

        using var command = connection.CreateCommand();
        var provider = dbContext.Database.ProviderName;

        if (dbContext.Database.IsSqlite())
        {
            command.CommandText = "SELECT COUNT(1) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'";
        }
        else if (provider?.Contains("Oracle") == true)
        {
            // Oracle metadata is case-sensitive and stored in UPPERCASE
            command.CommandText = "SELECT COUNT(1) FROM user_tables";
        }
        else if (provider?.Contains("MySql") == true || provider?.Contains("Pomelo") == true)
        {
            // MySQL needs to check the current database schema
            command.CommandText = "SELECT COUNT(1) FROM information_schema.tables WHERE table_schema = DATABASE()";
        }
        else
        {
            // Standard SQL (PostgreSQL/SQL Server)
            command.CommandText = "SELECT COUNT(1) FROM information_schema.tables";
        }

        var result = await command.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt32(result) > 0;
    }

    private void AddParam(IDbCommand cmd, string name, string value)
    {
        var p = cmd.CreateParameter();
        p.ParameterName = name;
        p.Value = value;
        cmd.Parameters.Add(p);
    }
}
