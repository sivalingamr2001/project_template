using Janatics.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Template;

public static class TemplateEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // GET ALL (Paged)
        group.MapGet("/", async ([AsParameters] PagedQuery query, TemplateService service, CancellationToken ct) =>
        {
            var result = await service.GetAllAsync(query, ct);
            return result.Success ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithName("GetTemplates");

        // GET BY ID
        group.MapGet("/{id:int}", async (int id, TemplateService service, CancellationToken ct) =>
        {
            var result = await service.GetByIdAsync(id, ct);
            return result.Success ? Results.Ok(result) : Results.NotFound(result);
        });

        // CREATE
        group.MapPost("/", async (TemplateRequest request, TemplateService service, CancellationToken ct) =>
        {
            if (string.IsNullOrEmpty(request.Name))
                return Results.BadRequest(ApiResult<TemplateResponse>.Fail("Name is required"));

            var result = await service.CreateAsync(request, ct);
            return result.Success ? Results.Created($"/api/templates/{result.Data!.TemplateId}", result) : Results.BadRequest(result);
        });

        // DELETE
        group.MapDelete("/{id:int}", async (int id, TemplateService service, CancellationToken ct) =>
        {
            var result = await service.DeleteAsync(id, ct);
            return result.Success ? Results.Ok(result) : Results.NotFound(result);
        });
    }
}
