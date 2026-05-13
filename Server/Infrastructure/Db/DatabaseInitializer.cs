using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Domain.Enums;
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

            // Seed the MySQL Stored Procedure for sequential ticket numbering
            await SeedStoredProcedureAsync(cancellationToken);

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

    private async Task SeedStoredProcedureAsync(CancellationToken cancellationToken)
    {
        try
        {
            logger.LogInformation("Seeding GetNextTicketNumber stored procedure into MySQL...");

            // Drop existing instance first to guarantee overwrite fixes apply safely
            await dbContext.Database.ExecuteSqlRawAsync("DROP PROCEDURE IF EXISTS GetNextTicketNumber;", cancellationToken);

            // Compiled fail-safe procedural logic definition string
            const string spScript = @"
                CREATE PROCEDURE GetNextTicketNumber(OUT out_ticket_number VARCHAR(50))
                BEGIN
                    DECLARE today_str VARCHAR(8);
                    DECLARE prefix VARCHAR(20);
                    DECLARE last_seq INT DEFAULT 0;
                    DECLARE next_seq INT;

                    SET today_str = DATE_FORMAT(UTC_TIMESTAMP(), '%Y%m%d');
                    SET prefix = CONCAT('NAS-REQ-', today_str, '-');

                    SELECT COALESCE(
                        MAX(
                            CAST(
                                CASE 
                                    WHEN ticket_number LIKE CONCAT(prefix, '%') 
                                    THEN SUBSTRING(ticket_number, LENGTH(prefix) + 1)
                                    ELSE 0 
                                END AS UNSIGNED
                            )
                        ), 0
                    )
                    INTO last_seq
                    FROM jan_accessitems
                    WHERE ticket_number LIKE CONCAT(prefix, '%')
                    FOR UPDATE;

                    SET next_seq = last_seq + 1;
                    SET out_ticket_number = CONCAT(prefix, LPAD(next_seq, 3, '0'));
                END;";

            await dbContext.Database.ExecuteSqlRawAsync(spScript, cancellationToken);
            logger.LogInformation("Stored procedure seeded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to seed stored procedure: {Message}", ex.Message);
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
                    Password = "password",
                    Email = "john@example.com",
                    UserRole = UserRole.User,
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
                    UserRole = UserRole.Hod,
                    IsActive = true
                },
                new()
                {
                    EmployeeId = 3,
                    FirstName = "Rose",
                    LastName = "Merry",
                    UserName = "rosemerry",
                    Password = "password",
                    Email = "rose@example.com",
                    UserRole = UserRole.Operator,
                    IsActive = true
                },
                new()
                {
                    EmployeeId = 4,
                    FirstName = "Admin",
                    LastName = "Dev",
                    UserName = "DevAdmin",
                    Password = "password",
                    Email = "admin@example.com",
                    UserRole = UserRole.Admin,
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
