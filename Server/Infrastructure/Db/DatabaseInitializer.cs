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
        // 1. Ensure the database file and schema are created
        // This creates the tables if migrations haven't run or don't exist yet
        var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();

        // For SQLite, we check if the database exists, then create tables
        if (!await databaseCreator.ExistsAsync(cancellationToken))
        {
            await databaseCreator.CreateAsync(cancellationToken);
        }

        // Check if the table "jan_employees" exists before querying
        if (!await TableExistsAsync("jan_employees", cancellationToken))
        {
            await databaseCreator.CreateTablesAsync(cancellationToken);
        }

        // 2. Now it is safe to check for data and seed
        if (!await dbContext.Employees.AnyAsync(cancellationToken))
        {
            await SeedEmployeesAsync(cancellationToken);
        }

        if (!await dbContext.Categories.AnyAsync(cancellationToken))
        {
            await SeedBudgetMetadataAsync(cancellationToken);
        }
    }

    private async Task SeedBudgetMetadataAsync(CancellationToken cancellationToken)
    {
        var budgetData = new List<CategoryEntity>
        {
            CreateCategory(1, "Product Design", ["Benchmarking sample", "FEA Analysis", "CFD Analysis", "Design consultancy", "Others"]),
            CreateCategory(2, "Concept devpt.", ["Comp.devpt-Concept", "Machining components", "Plastic - Hand moulds", "Rubber moulds", "3D printing", "RPT", "MIM", "Jigs & fixtures", "Concept testing"]),
            CreateCategory(3, "Prototype devpt.", ["Machining components", "Plastic - Inj. moulds", "Aluminium - Die casting", "Investment casting", "Stamping tools", "Rubber moulds", "Jigs & fixtures", "Comp. mfg.", "Testing"]),
            CreateCategory(4, "Product testing", ["Testing instruments", "Testing fixtures", "Certification", "Others"]),
            CreateCategory(5, "Capital equipments", ["Testing equipments", "Special machines", "Others"]),
            CreateCategory(6, "Field validation", ["Product development"])
        };

        await dbContext.Categories.AddRangeAsync(budgetData, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private CategoryEntity CreateCategory(int id, string name, string[] itemNames)
    {
        var category = new CategoryEntity
        {
            CategoryId = id,
            Name = name,
            CreatedBy = "System",
            CreatedOn = DateTime.UtcNow
        };

        foreach (var itemName in itemNames)
        {
            category.CostItems.Add(new CostItemEntity
            {
                Name = itemName,
                CreatedBy = "System",
                CreatedOn = DateTime.UtcNow
            });
        }

        return category;
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
