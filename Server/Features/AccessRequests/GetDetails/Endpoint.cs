using Microsoft.AspNetCore.Mvc;
using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.GetDetails;

public static class GetAccessRequestDetailsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
    group.MapGet("/{accessReqId:int}", async (
    int accessReqId,
    [FromQuery] int viewerEmployeeId,
    AccessRequestWorkflowService service,
    CancellationToken cancellationToken) =>
    {
        var response = await service.GetDetailsAsync(accessReqId, viewerEmployeeId, cancellationToken);
        return Results.Ok(response);
    })
    .WithName("GetAccessRequestDetails")
    .WithOpenApi();

    group.MapGet("/expiration/{accessItemId:int}", async (
        int accessItemId,
        AccessRequestWorkflowService service, // Injected service
        CancellationToken cancellationToken) =>
    {
        // Note: Assumes your service method takes accessItemId
        var response = await service.GetExpirationDateUtcWithTime(accessItemId, cancellationToken);
        return Results.Ok(response);
    })
    .WithName("GetAccessItemExpirationDate")
    .WithOpenApi();
    }
}
