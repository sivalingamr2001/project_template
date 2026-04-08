using Server.Features.AccessRequests.Common;

namespace Server.Features.Notifications.MarkRead;

public static class MarkNotificationReadEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/{auditId:int}/read", async (
            int auditId,
            MarkNotificationReadRequest request,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            await service.MarkNotificationReadAsync(auditId, request.EmployeeId, cancellationToken);
            return Results.NoContent();
        })
        .WithName("MarkNotificationRead")
        .WithOpenApi();
    }
}
