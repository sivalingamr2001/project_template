using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Dashboard.GetDashboard;

public static class GetDashboardEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/{userId:int}", async (
            int userId,
            [AsParameters] GetDashboardQuery query,
            GetDashboardService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetAsync(userId, query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetDashboard")
        .WithOpenApi();
    }
}
