using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Departments.Update;

public static class UpdateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/{deptId:int}", async (
            int deptId,
            [FromBody] UpdateDepartmentRequest request,
            UpdateDepartmentService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdateAsync(deptId, request, cancellationToken);
                return updated is not null
                    ? Results.Ok(updated)
                    : Results.NotFound(new { Message = $"Department '{deptId}' was not found." });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { Message = ex.Message });
            }
        })
        .WithName("UpdateDepartment")
        .WithOpenApi();
    }
}

