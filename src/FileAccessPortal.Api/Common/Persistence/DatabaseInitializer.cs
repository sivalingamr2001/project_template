using FileAccessPortal.Api.Common.Auth;
using FileAccessPortal.Api.Common.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace FileAccessPortal.Api.Common.Persistence;

public sealed class DatabaseInitializer(
    AppDbContext dbContext,
    AccessManagementDbContext accessDbContext,
    PasswordHasher passwordHasher)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);
        await accessDbContext.Database.EnsureCreatedAsync(cancellationToken);

        if (await dbContext.Employees.AnyAsync(cancellationToken))
        {
            return;
        }

        await SeedDepartmentsAsync(cancellationToken);
        await SeedEmployeesAsync(cancellationToken);
    }

    private async Task SeedDepartmentsAsync(CancellationToken cancellationToken)
    {
        var departments = new[]
        {
            new DepartmentEntity { DepartmentId = 10, Name = "Finance", HodEmployeeId = 2001 },
            new DepartmentEntity { DepartmentId = 20, Name = "Human Resources", HodEmployeeId = 2002 },
            new DepartmentEntity { DepartmentId = 30, Name = "Operations" }
        };

        await dbContext.Departments.AddRangeAsync(departments, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task SeedEmployeesAsync(CancellationToken cancellationToken)
    {
        var employees = new[]
        {
            CreateEmployee(1001, "EMP001", "Anitha", "anitha@corp.local", 10, "Finance", "User"),
            CreateEmployee(2001, "EMP002", "Rahul", "rahul@corp.local", 10, "Finance", "Hod"),
            CreateEmployee(1002, "EMP003", "Meena", "meena@corp.local", 20, "Human Resources", "User"),
            CreateEmployee(2002, "EMP004", "Karthik", "karthik@corp.local", 20, "Human Resources", "Hod"),
            CreateEmployee(3001, "EMP005", "Sanjay", "sanjay@corp.local", 30, "Operations", "ItTeam")
        };

        await dbContext.Employees.AddRangeAsync(employees, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private EmployeeEntity CreateEmployee(
        int employeeId,
        string employeeCode,
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
            EmployeeCode = employeeCode,
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
