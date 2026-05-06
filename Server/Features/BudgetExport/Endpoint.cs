namespace Server.Features.BudgetExport;

public static class BudgetExportEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Endpoint for Excel File Download
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

        // Endpoint for Raw JSON Data
        group.MapGet("/{budgetId:int}/report-data", async (
            int budgetId,
            BudgetExportService service,
            CancellationToken cancellationToken) =>
        {
            var data = await service.GetReportDataAsync(budgetId, cancellationToken);

            return data is null
                ? Results.NotFound(new { message = $"Budget record '{budgetId}' was not found." })
                : Results.Ok(data);
        })
        .WithName("GetReportDataByBudgetID")
        .WithOpenApi();
    }
}
