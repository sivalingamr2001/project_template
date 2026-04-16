using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

namespace Server.Features.Departments.GetList;

public static class GetDepartmentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (AppDbContext dbContext) =>
        {
            var departments = await dbContext.Departments
                .Where(d => d.IsActive)
                .OrderBy(d => d.DeptId)
                .Select(d => new DepartmentDto(d.DeptId, d.DeptName))
                .ToListAsync();

            return Results.Ok(new DepartmentListResponse(departments));
        })
        .WithName("GetDepartments")
        .WithOpenApi();
    }
}

public sealed record DepartmentDto(int Id, string Name);

public sealed record DepartmentListResponse(IReadOnlyList<DepartmentDto> Departments);
