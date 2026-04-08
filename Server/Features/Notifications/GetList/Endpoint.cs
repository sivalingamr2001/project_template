using Server.Features.AccessRequests.Common;

namespace Server.Features.Notifications.GetList;

public static class GetNotificationsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/{employeeId:int}", async (
            int employeeId,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetNotificationsAsync(employeeId, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetNotifications")
        .WithOpenApi();
    }
}
