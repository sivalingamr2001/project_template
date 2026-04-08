using Microsoft.AspNetCore.Mvc;

namespace Server.Features.AccessRequests.GetList;

public static class GetAccessRequestsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            [AsParameters] GetAccessRequestsQuery query,
            GetAccessRequestsService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetAccessRequests")
        .WithOpenApi();
    }
}
