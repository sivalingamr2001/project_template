using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Dashboard.AccessRequestDashboard;

public static class GetAccessRequestDashboardEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/access-requests", async (
            int? empId,
            int? approverId,
            string? status,
            DateTime? from,
            DateTime? to,
            AccessRequestDashboardService service,
            CancellationToken cancellationToken) =>
        {
            var query = new DashboardQuery(empId, approverId, status, from, to);
            var response = await service.GetAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetAccessRequestDashboard")
        .WithOpenApi();
    }
}
