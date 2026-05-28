using Microsoft.AspNetCore.Mvc;
using Server.Features.AccessRequests.ReviewByHod;
using Server.Features.Employees;

namespace Server.Features.HOD;

public class GetHodDetailsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            [AsParameters] GetEmployeesQuery query,
            HODService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetHodAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetHod")
        .WithOpenApi();

        group.MapGet("/details", async (
             [FromQuery] string? employeeId,
             [FromQuery] string? name,
             [FromQuery] string? email,
             [FromQuery] string? userId,
             HODService service,
             CancellationToken cancellationToken) =>
                {
                    // Combine parameters into a unified search string or pass them down cleanly
                    var searchTerm = employeeId ?? name ?? email ?? userId ?? string.Empty;

                    if (string.IsNullOrWhiteSpace(searchTerm))
                    {
                        return Results.BadRequest("At least one search parameter (employeeId, name, email, userId) must be provided.");
                    }

                    // FIX: Execute SearchHodAsync with the resolved parameter 
                    var response = await service.SearchHodAsync(searchTerm, cancellationToken);
                    return Results.Ok(response);
                })
         .WithName("GetHodDetailsByData")
         .WithOpenApi();
    }
}
