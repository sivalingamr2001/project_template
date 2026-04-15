using Microsoft.AspNetCore.Mvc;
using Server.Shared.Constants;

namespace Server.Features.Departments.Create;

public static class CreateDepartmentEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", ([FromBody] CreateDepartmentRequest request) =>
        {
            if (request.Id <= 0)
            {
                return Results.BadRequest(new { Message = "Department ID must be a positive number." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { Message = "Department name is required." });
            }

            var added = DepartmentCatalog.TryAdd(request.Id, request.Name);
            if (!added)
            {
                return Results.Conflict(new { Message = $"Department '{request.Id}' already exists." });
            }

            return Results.Created($"/api/departments/{request.Id}", new DepartmentDto(request.Id, request.Name.Trim()));
        })
        .WithName("CreateDepartment")
        .WithOpenApi();
    }
}

public sealed record CreateDepartmentRequest(int Id, string Name);

public sealed record DepartmentDto(int Id, string Name);

