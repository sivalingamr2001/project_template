using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Server.Domain.Entities;
using Server.Shared.Helpers;

namespace Server.Infrastructure.Db;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    PasswordHasher passwordHasher)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.Database.MigrateAsync(cancellationToken);

        if (!await TableExistsAsync("jan_employees", cancellationToken))
        {
            var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();
            await databaseCreator.CreateTablesAsync(cancellationToken);
        }

        if (await dbContext.Employees.AnyAsync(cancellationToken))
        {
            return;
        }

        await SeedEmployeesAsync(cancellationToken);
    }

    private async Task SeedEmployeesAsync(CancellationToken cancellationToken)
    {
        var employees = new[]
        {
            CreateEmployee(1001, "Anitha", "anitha@corp.local", 10, "Finance", "User"),
            CreateEmployee(2001, "Rahul", "rahul@corp.local", 10, "Finance", "Hod"),
            CreateEmployee(1002, "Meena", "meena@corp.local", 20, "Human Resources", "User"),
            CreateEmployee(2002, "Karthik", "karthik@corp.local", 20, "Human Resources", "Hod"),
            CreateEmployee(3001, "Sanjay", "sanjay@corp.local", 30, "Operations", "ItTeam")
        };

        await dbContext.Employees.AddRangeAsync(employees, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private EmployeeEntity CreateEmployee(
        int employeeId,
        string name,
        string email,
        int departmentId,
        string departmentName,
        string role)
    {
        var (hash, salt) = passwordHasher.HashPassword("Password@123");

        return new EmployeeEntity
        {
            EmployeeId = employeeId,
            Name = name,
            Email = email,
            DepartmentId = departmentId,
            DepartmentName = departmentName,
            Role = role,
            PasswordHash = hash,
            PasswordSalt = salt
        };
    }

    private async Task<bool> TableExistsAsync(string tableName, CancellationToken cancellationToken)
    {
        await using var connection = dbContext.Database.GetDbConnection();

        if (connection.State != System.Data.ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();

        if (dbContext.Database.IsSqlite())
        {
            command.CommandText = "SELECT COUNT(1) FROM sqlite_master WHERE type = 'table' AND name = @tableName;";
        }
        else
        {
            command.CommandText = "SELECT COUNT(1) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = @tableName;";
        }

        var parameter = command.CreateParameter();
        parameter.ParameterName = "@tableName";
        parameter.Value = tableName;
        command.Parameters.Add(parameter);

        var result = await command.ExecuteScalarAsync(cancellationToken);
        return Convert.ToInt32(result) > 0;
    }
}
