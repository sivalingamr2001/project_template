namespace Server.Features.AccessRequests.Create;

public static class CreateAccessRequestEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", async (
            CreateAccessRequest request,
            CreateAccessRequestService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.CreateAsync(request, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("CreateAccessRequest")
        .WithOpenApi();
    }
}
