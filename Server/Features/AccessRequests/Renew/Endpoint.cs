using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.Renew;

public static class RenewAccessRequestEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/{accessReqId:int}/renew", async (
            int accessReqId,
            RenewAccessRequest request,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.RenewAsync(accessReqId, request, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("RenewAccessRequest")
        .WithOpenApi();
    }
}
