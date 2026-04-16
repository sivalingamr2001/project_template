using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

namespace Server.Features.Departments.Update;

public static class UpdateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/{deptId:int}", async (int deptId, [FromBody] UpdateDepartmentRequest request, AppDbContext dbContext) =>
        {
            if (deptId <= 0)
            {
                return Results.BadRequest(new { Message = "Department ID must be a positive number." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { Message = "Department name is required." });
            }

            var department = await dbContext.Departments.FirstOrDefaultAsync(d => d.DeptId == deptId);
            if (department == null)
            {
                return Results.NotFound(new { Message = $"Department '{deptId}' was not found." });
            }

            department.DeptName = request.Name.Trim();
            department.UpdatedOn = DateTime.UtcNow;
            // department.ModifiedBy = get from user

            await dbContext.SaveChangesAsync();

            return Results.Ok(new DepartmentDto(department.DeptId, department.DeptName));
        })
        .WithName("UpdateDepartment")
        .WithOpenApi();
    }
}

public sealed record UpdateDepartmentRequest(string Name);

public sealed record DepartmentDto(int Id, string Name);

