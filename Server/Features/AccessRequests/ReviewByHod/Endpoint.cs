using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.ReviewByHod;

public static class ReviewAccessRequestByHodEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/{accessReqId:int}/{accessItemId:int}/hod-review", async (
            int accessReqId,
            int accessItemId,
            ReviewByHodRequest request,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.ReviewByHodAsync(accessReqId, accessItemId, request, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("ReviewAccessRequestByHod")
        .WithOpenApi();
    }
}
