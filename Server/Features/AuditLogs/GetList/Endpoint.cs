using Microsoft.AspNetCore.Mvc;

namespace Server.Features.AuditLogs.GetList;

public static class GetAuditLogsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet(string.Empty, async (
            [AsParameters] GetAuditLogsQuery query,
            GetAuditLogsService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetAuditLogs")
        .WithOpenApi();
    }
}
