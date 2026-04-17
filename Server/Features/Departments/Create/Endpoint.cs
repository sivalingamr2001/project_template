using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Departments.Create;

public static class CreateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", async (
            [FromBody] CreateDepartmentRequest request,
            CreateDepartmentService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var created = await service.CreateAsync(request, cancellationToken);
                return Results.Created($"/api/departments/{created.Id}", created);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { Message = ex.Message });
            }
        })
        .WithName("CreateDepartment")
        .WithOpenApi();
    }
}

