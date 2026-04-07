namespace Server.Features.Requests.Create;

public static class CreateRequestEndpoint
{
    public static void MapAccessRequestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/request").WithTags("AccessRequests");

        group.MapPost("/create", async (
            CreateAccessRequest request,
           AccessRequestHandler handler,
            CancellationToken ct) =>
        {
            var response = await handler.HandleAsync(request, ct);

            // Returns a standard 200 Ok with the response DTO
            return Results.Ok(response);
        })
        .WithName("CreateAccessRequest")
        .WithOpenApi();

        group.MapGet("/get", async (AccessRequestHandler handler, CancellationToken ct) =>
        {
            var result = await handler.GetAllAsync(ct);

            return result is not null
                ? Results.Ok(result)
                : Results.NotFound(new { Message = $"Requests not found" });
        })
       .WithName("GetRequestById")
       .WithOpenApi();
    }
}
