using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Server.Domain.Entities;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

namespace Server.Features.Departments.Create;

public static class CreateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", async ([FromBody] CreateDepartmentRequest request, AppDbContext dbContext, IConfiguration configuration) =>
        {
            if (request.DeptId <= 0)
            {
                return Results.BadRequest(new { Message = "Department ID must be a positive number." });
            }

            // Check if already exists
            var existing = await dbContext.Departments.FirstOrDefaultAsync(d => d.DeptId == request.DeptId);
            if (existing != null)
            {
                return Results.Conflict(new { Message = $"Department '{request.DeptId}' already exists." });
            }

            // Get HOD connection string
            var hodConnectionString = configuration.GetValue<string>("Database:MySqlConnectionString_HOD");
            if (string.IsNullOrEmpty(hodConnectionString))
            {
                return Results.Problem("HOD Connection string is missing.");
            }

            // Fetch from HOD
            using var connection = new MySqlConnection(hodConnectionString);
            var query = "SELECT id, hodname FROM hod_master WHERE id = @Id AND deleted = 0";
            var hodRecord = await connection.QueryFirstOrDefaultAsync<(int id, string hodname)>(query, new { Id = request.DeptId });

            if (hodRecord == default)
            {
                return Results.NotFound(new { Message = $"Department '{request.DeptId}' not found in HOD database." });
            }

            // Save to main DB
            var department = new DepartmentEntity
            {
                DeptId = hodRecord.id,
                DeptName = hodRecord.hodname,
                DeptHodId = request.DeptHodId,
                IsActive = true,
                CreatedBy = "System" // or get from user
            };

            dbContext.Departments.Add(department);
            await dbContext.SaveChangesAsync();

            return Results.Created($"/api/departments/{department.DeptId}", new DepartmentDto(department.DeptId, department.DeptName));
        })
        .WithName("CreateDepartment")
        .WithOpenApi();
    }
}

public sealed record CreateDepartmentRequest(int DeptId, int DeptHodId);

public sealed record DepartmentDto(int Id, string Name);

