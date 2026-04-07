using Microsoft.EntityFrameworkCore;
using Server.Common.Auth;
using Server.Domain.Entities;

namespace Server.Infrastructure.Persistence;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    PasswordHasher passwordHasher)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);

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
}
