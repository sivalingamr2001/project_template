namespace Server.Features.Dashboard;

public static class DashboardEndpoint
{
    public static void MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/dashboard").WithTags("Dashboard");

        group.MapGet("/dashboard/{empId:int}", async (int empId, DashboardHandler handler, CancellationToken ct) =>
        {
            var data = await handler.GetPortalDataAsync(empId, ct);
            return Results.Ok(data);
        })
    .WithName("GetDashboardData")
    .WithOpenApi();
    }
}
