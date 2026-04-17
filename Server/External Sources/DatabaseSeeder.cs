using JanaticsApi.Domain.Entities;
using JanaticsApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JanaticsApi.Infrastructure.Seeding;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IServiceProvider services, ILogger logger)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        try
        {
            logger.LogInformation("Ensuring database exists and schema is up to date...");
            await db.Database.EnsureCreatedAsync();
            logger.LogInformation("Database schema ready.");

            if (await db.Departments.AnyAsync())
            {
                logger.LogInformation("Seed data already present – skipping.");
                return;
            }

            logger.LogInformation("Seeding initial data...");
            var now = DateTime.UtcNow;

            // ── 1. Create IT department (no HOD yet) ──────────────────────────
            var itDept = new Department
            {
                DepartmentName = "IT",
                HodId = null,
                CreatedOn = now,
                UpdatedOn = now
            };
            db.Departments.Add(itDept);
            await db.SaveChangesAsync(); // get DepartmentId

            // ── 2. Seed employees ─────────────────────────────────────────────

            // Admin user
            var admin = new Employee
            {
                FirstName = "System",
                LastName = "Admin",
                Username = "admin",
                Password = "Admin@123",
                Email = "admin@janatics.com",
                Mobile = "9000000001",
                Location = "HQ",
                Role = "Admin",
                IsActive = true,
                DepartmentId = itDept.DepartmentId,
                CreatedOn = now,
                UpdatedOn = now
            };

            // HOD user
            var hod = new Employee
            {
                FirstName = "Rajesh",
                LastName = "Kumar",
                Username = "rajesh.kumar",
                Password = "Hod@123",
                Email = "rajesh.kumar@janatics.com",
                Mobile = "9000000002",
                Location = "Chennai",
                Role = "HOD",
                IsActive = true,
                DepartmentId = itDept.DepartmentId,
                CreatedOn = now,
                UpdatedOn = now
            };

            // Regular employee
            var employee = new Employee
            {
                FirstName = "Priya",
                LastName = "Sharma",
                Username = "priya.sharma",
                Password = "Emp@123",
                Email = "priya.sharma@janatics.com",
                Mobile = "9000000003",
                Location = "Chennai",
                Role = "Employee",
                IsActive = true,
                DepartmentId = itDept.DepartmentId,
                CreatedOn = now,
                UpdatedOn = now
            };

            db.Employees.AddRange(admin, hod, employee);
            await db.SaveChangesAsync();

            // ── 3. Assign HOD to the IT department ────────────────────────────
            itDept.HodId = hod.EmployeeId;
            itDept.UpdatedOn = now;
            await db.SaveChangesAsync();

            logger.LogInformation(
                "Seeding complete. Admin={AdminId}, HOD={HodId}, Employee={EmpId}, Dept={DeptId}",
                admin.EmployeeId, hod.EmployeeId, employee.EmployeeId, itDept.DepartmentId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
