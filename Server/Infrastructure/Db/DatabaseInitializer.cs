using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Server.Domain.Entities;
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

            // Seed data
            await SeedDataAsync(cancellationToken);

            logger.LogInformation("Database initialization completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while creating the database tables: {Message}", ex.Message);

            // Re-throw if you want the application to stop starting up on failure
            throw;
        }
    }

    private async Task SeedDataAsync(CancellationToken cancellationToken)
    {
        // Seed employees
        if (!await dbContext.Employees.AnyAsync(cancellationToken))
        {
            var employees = new List<EmployeeEntity>
            {
                new()
                {
                    EmployeeId = 1,
                    FirstName = "John",
                    LastName = "Doe",
                    UserName = "johndoe",
                    Password = "password", // In real app, hash it
                    Email = "john@example.com",
                    UserRole = "User",
                    IsActive = true
                },
                new()
                {
                    EmployeeId = 2,
                    FirstName = "Jane",
                    LastName = "Smith",
                    UserName = "janesmith",
                    Password = "password",
                    Email = "jane@example.com",
                    UserRole = "Hod",
                    IsActive = true
                }
            };

            dbContext.Employees.AddRange(employees);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // Seed departments
        if (!await dbContext.Departments.AnyAsync(cancellationToken))
        {
            var departments = new List<DepartmentEntity>
            {
                new()
                {
                    DeptId = 101,
                    DeptName = "IT",
                    DeptHodId = 2, // Jane is HOD
                    IsActive = true
                }
            };

            dbContext.Departments.AddRange(departments);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
