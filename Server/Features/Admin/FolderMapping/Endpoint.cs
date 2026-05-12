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

        group.MapPost("/folder-mapping", async Task<IResult> (
            FolderMappingCreateOrUpdateRequest request,
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

        group.MapDelete("/folder-mapping/{id:int}", async (
            int id, // This will now correctly bind from the URL path
            FolderMappingService service,
            CancellationToken cancellationToken) =>
        {
            await service.DeleteFolderMappingAsync(id, cancellationToken);
            return TypedResults.NoContent();
        })
        .WithName("DeleteFolderMapping")
        .WithOpenApi();

        group.MapGet("/folder-mapping/export", async (
            FolderMappingService service,
            CancellationToken cancellationToken) =>
        {
            // This now returns List<FolderResponse>
            var list = await service.GetParentFoldersAsync(cancellationToken);

            return TypedResults.Ok(list);
        })
        .WithName("ExportFolderMappings")
        .WithOpenApi();

        // Change this:
        group.MapGet("/folder-mapping/hierarchy", async ( // Added /hierarchy
            FolderMappingService service,
            CancellationToken cancellationToken) =>
        {
            var list = await service.GetFolderHierarchyAsync();
            return TypedResults.Ok(list);
        })
        .WithName("GetFolderHierarchy")
        .WithOpenApi();
    }
}
