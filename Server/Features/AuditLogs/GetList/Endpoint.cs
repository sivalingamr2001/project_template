using Microsoft.AspNetCore.Builder;

namespace Server.Features.AuditLogs.GetList;

public static class GetAuditLogsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            GetAuditLogsService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetAsync(cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetAuditLogs")
        .WithOpenApi();
    }
}
