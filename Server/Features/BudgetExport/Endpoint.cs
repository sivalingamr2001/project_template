namespace Server.Features.BudgetExport;

public static class BudgetExportEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/{budgetId:int}/export", async (
            int budgetId,
            BudgetExportService service,
            CancellationToken cancellationToken) =>
        {
            var workbook = await service.ExportAsync(budgetId, cancellationToken);
            if (workbook is null)
            {
                return Results.NotFound(new { message = $"Budget record '{budgetId}' was not found." });
            }

            return Results.File(
                workbook.Content,
                workbook.ContentType,
                workbook.FileName);
        })
        .WithName("ExportBudgetWorkbook")
        .WithOpenApi();
    }
}
