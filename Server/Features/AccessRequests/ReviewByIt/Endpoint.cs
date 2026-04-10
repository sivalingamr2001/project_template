using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.ReviewByIt;

public static class ReviewAccessRequestByItEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/{accessReqId:int}/{accessItemId:int}/it-review", async (
            int accessReqId,
            int accessItemId,
            ReviewByItRequest request,
            AccessRequestWorkflowService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.ReviewByItAsync(accessReqId, accessItemId, request, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("ReviewAccessRequestByIt")
        .WithOpenApi();
    }
}
