using Microsoft.AspNetCore.Mvc;
using Server.Shared.Constants;

namespace Server.Features.Departments.Update;

public static class UpdateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/{deptId:int}", (int deptId, [FromBody] UpdateDepartmentRequest request) =>
        {
            if (deptId <= 0)
            {
                return Results.BadRequest(new { Message = "Department ID must be a positive number." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { Message = "Department name is required." });
            }

            var updated = DepartmentCatalog.TryUpdate(deptId, request.Name);
            return updated
                ? Results.Ok(new DepartmentDto(deptId, request.Name.Trim()))
                : Results.NotFound(new { Message = $"Department '{deptId}' was not found." });
        })
        .WithName("UpdateDepartment")
        .WithOpenApi();
    }
}

public sealed record UpdateDepartmentRequest(string Name);

public sealed record DepartmentDto(int Id, string Name);

