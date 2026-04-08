using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.Revoke;

public static class RevokeAccessRequestEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/{accessReqId:int}/revoke", async (
            int accessReqId,
            RevokeAccessRequest request,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.RevokeAsync(accessReqId, request, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("RevokeAccessRequest")
        .WithOpenApi();
    }
}
