

using Janatics.Application.Common.Models;
using Server.Infrastructure.Db;

namespace Server.Features.ActualAmount;

public static class ActualAmountsEndpoints
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/actual-amounts", HandleGetActualAmountsAsync)
            .WithName("GetActualAmounts")
            .WithSummary("Get actual amounts for a project by category and subcategory")
            .WithOpenApi()
            .Produces<ApiResult<ActualAmountsResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResult<string>>(StatusCodes.Status400BadRequest);
    }

    private static Task<IResult> HandleGetActualAmountsAsync(
        ActualAmountsRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.projectNumber) || string.IsNullOrWhiteSpace(request.ProductNo))
        {
            return Task.FromResult(Results.BadRequest(
                ApiResult<string>.Fail("projectNumber and ProductNo are required")));
        }

        try
        {
            // Get actual amounts (using mock data for now)
            var result = ActualAmountsService.GetActualAmounts(request.projectNumber, request.ProductNo);

            // For future database integration, uncomment below:
            // var result = await ActualAmountsService.GetActualAmountsFromDbAsync(db, request.projectNumber, request.ProductNo, ct);

            return Task.FromResult(Results.Ok(ApiResult<ActualAmountsResponse>.Ok(result)));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Results.BadRequest(
                ApiResult<string>.Fail($"Error fetching actual amounts: {ex.Message}")));
        }
    }
}
