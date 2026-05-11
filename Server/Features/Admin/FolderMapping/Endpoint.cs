using Microsoft.AspNetCore.Http.HttpResults;

namespace Server.Features.Admin.FolderMapping;

public static class FolderMappingEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/folder-mapping", async (
            FolderMappingService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetFolderMappingsAsync(cancellationToken);
            return TypedResults.Ok(response);
        })
        .WithName("GetFolderMappings")
        .WithOpenApi();

        group.MapPost("/folder-mapping", async (
            FolderMappingUpdateRequest request,
            FolderMappingService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var saved = await service.SaveFolderMappingAsync(request, cancellationToken);
                return TypedResults.Ok(saved);
            }
            catch (InvalidOperationException exception)
            {
                return TypedResults.BadRequest(new { Message = exception.Message });
            }
        })
        .WithName("SaveFolderMapping")
        .WithOpenApi();
    }
}
