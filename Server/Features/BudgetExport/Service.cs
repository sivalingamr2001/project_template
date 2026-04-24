using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;

namespace Server.Features.BudgetExport;

public sealed class BudgetExportService(
    AppDbContext dbContext,
    ExcelReportBuilder workbookBuilder)
{
    public async Task<BudgetExportWorkbook?> ExportAsync(int budgetId, CancellationToken cancellationToken)
    {
        var header = await dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.BudgetId == budgetId && b.IsActive == 1)
            .Select(b => new
            {
                b.BudgetId,
                b.TemplateId,
                b.ProjectNumber,
                b.ProductNo,
                ProductName = b.ProjectTitle,
                b.CreatedOn,
                TemplateName = b.Template != null ? b.Template.Name : null,
                TemplateJson = b.Template != null ? b.Template.TemplateJson : null
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (header is null)
        {
            return null;
        }

        var categoryData = await dbContext.BudgetCategories
            .AsNoTracking()
            .Where(c => c.BudgetId == budgetId)
            .OrderBy(c => c.CategoryId)
            .Select(c => new BudgetExportCategoryData(
                string.Empty,
                c.CategoryName,
                c.Items
                    .OrderBy(i => i.ItemId)
                    .Select(i => new BudgetExportItemData(
                        string.Empty,
                        i.ItemName,
                        i.Planned,
                        i.Actual,
                        string.Empty))
                    .ToList()))
            .ToListAsync(cancellationToken);

        var template = BudgetTemplateExportModel.Parse(header.TemplateName, header.TemplateJson);
        var orderedCategories = BuildOrderedCategories(template, categoryData);

        var exportSource = new BudgetExportSource(
            header.BudgetId,
            header.TemplateId,
            header.ProjectNumber,
            header.ProductNo,
            header.ProductName,
            header.CreatedOn,
            string.IsNullOrWhiteSpace(template.TemplateName) ? "Project Cost Report" : template.TemplateName,
            header.TemplateJson,
            orderedCategories);

        return workbookBuilder.Build(exportSource);
    }

    private IReadOnlyList<BudgetExportCategoryData> BuildOrderedCategories(
        BudgetTemplateExportModel template,
        IReadOnlyList<BudgetExportCategoryData> budgetCategories)
    {
        var categoryLookup = budgetCategories.ToDictionary(
            c => BudgetExportNameNormalizer.BuildCategoryKey(c.CategoryName),
            c => c,
            StringComparer.Ordinal);

        var ordered = new List<BudgetExportCategoryData>();
        var categoryNumber = 1;

        foreach (var templateCategory in template.Categories)
        {
            var sourceCategory = categoryLookup.TryGetValue(
                BudgetExportNameNormalizer.BuildCategoryKey(templateCategory.Name),
                out var matchedCategory)
                ? matchedCategory
                : new BudgetExportCategoryData(string.Empty, templateCategory.Name, []);

            var orderedItems = BuildOrderedItems(templateCategory, sourceCategory, categoryNumber);
            ordered.Add(new BudgetExportCategoryData(categoryNumber.ToString(), templateCategory.Name, orderedItems));
            categoryNumber++;
        }

        foreach (var fallbackCategory in budgetCategories)
        {
            var fallbackKey = BudgetExportNameNormalizer.BuildCategoryKey(fallbackCategory.CategoryName);
            var alreadyAdded = ordered.Any(c =>
                BudgetExportNameNormalizer.BuildCategoryKey(c.CategoryName) == fallbackKey);

            if (alreadyAdded)
            {
                continue;
            }

            var fallbackItems = fallbackCategory.Items
                .Select((item, index) => new BudgetExportItemData(
                    $"{categoryNumber}.{index + 1}",
                    item.ItemName,
                    item.EstimatedAmount,
                    item.ActualAmount,
                    item.Remarks))
                .ToList();

            ordered.Add(new BudgetExportCategoryData(categoryNumber.ToString(), fallbackCategory.CategoryName, fallbackItems));
            categoryNumber++;
        }

        return ordered;
    }

    private static IReadOnlyList<BudgetExportItemData> BuildOrderedItems(
        BudgetTemplateCategoryExportModel templateCategory,
        BudgetExportCategoryData sourceCategory,
        int categoryNumber)
    {
        var itemLookup = sourceCategory.Items.ToDictionary(
            i => BudgetExportNameNormalizer.BuildItemKey(sourceCategory.CategoryName, i.ItemName),
            i => i,
            StringComparer.Ordinal);

        var orderedItems = new List<BudgetExportItemData>();
        var itemNumber = 1;

        foreach (var templateItem in templateCategory.Items)
        {
            var itemKey = BudgetExportNameNormalizer.BuildItemKey(templateCategory.Name, templateItem.Name);
            itemLookup.TryGetValue(itemKey, out var matchedItem);

            orderedItems.Add(new BudgetExportItemData(
                $"{categoryNumber}.{itemNumber}",
                templateItem.Name,
                matchedItem?.EstimatedAmount ?? 0m,
                matchedItem?.ActualAmount ?? 0m,
                matchedItem?.Remarks ?? string.Empty));

            itemNumber++;
        }

        foreach (var fallbackItem in sourceCategory.Items)
        {
            var fallbackKey = BudgetExportNameNormalizer.BuildItemKey(sourceCategory.CategoryName, fallbackItem.ItemName);
            var alreadyAdded = orderedItems.Any(i =>
                BudgetExportNameNormalizer.Normalize(i.ItemName) == BudgetExportNameNormalizer.Normalize(fallbackItem.ItemName));

            if (alreadyAdded || itemLookup.ContainsKey(fallbackKey) && templateCategory.Items.Any(t =>
                BudgetExportNameNormalizer.Normalize(t.Name) == BudgetExportNameNormalizer.Normalize(fallbackItem.ItemName)))
            {
                continue;
            }

            orderedItems.Add(new BudgetExportItemData(
                $"{categoryNumber}.{itemNumber}",
                fallbackItem.ItemName,
                fallbackItem.EstimatedAmount,
                fallbackItem.ActualAmount,
                fallbackItem.Remarks));
            itemNumber++;
        }

        return orderedItems;
    }
}
