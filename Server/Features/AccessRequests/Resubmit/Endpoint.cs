using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.Resubmit;

public static class ResubmitAccessItemEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/{accessReqId:int}/{accessItemId:int}/resubmit", async (
            int accessReqId,
            int accessItemId,
            ResubmitAccessItemRequest request,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.ResubmitAsync(accessReqId, accessItemId, request, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("ResubmitAccessItem")
        .WithOpenApi();
    }
}
