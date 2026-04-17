using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Departments.GetList;

public static class GetDepartmentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            [AsParameters] GetDepartmentQuery query,
            GetDepartmentsService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetDepartments")
        .WithOpenApi();
    }
}
