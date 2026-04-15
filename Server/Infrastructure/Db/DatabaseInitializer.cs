using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    PasswordHasher passwordHasher)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        // MigrateAsync handles creating the database and all tables defined in migrations
        await dbContext.Database.MigrateAsync(cancellationToken);

        // Check if data already exists to avoid duplicate seeding
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
            CreateEmployee("Admin", "admin@portal.com", 1, 101, "IT", "Admin", "JANADMIN")
        };

        await dbContext.Employees.AddRangeAsync(employees, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private EmployeeEntity CreateEmployee(
        string name,
        string email,
        int userId,
        int deptId,
        string departmentName,
        string role,
        string password)
    {
        var (hash, salt) = passwordHasher.HashPassword(password);

        return new EmployeeEntity
        {
            UserId = userId,
            UserName = name,
            Email = email,
            DeptId = deptId,
            DeptName = departmentName,
            UserRole = role,
            Password = password
        };
    }
}
