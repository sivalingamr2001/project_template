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
            .Where(b => b.BudgetId == budgetId && b.IsActive)
            .Select(b => new
            {
                b.BudgetId,
                b.EmployeeId,
                PreparedBy = dbContext.Employees
                    .Where(e => e.EmployeeId == b.EmployeeId)
                    .Select(e => e.Name)
                    .FirstOrDefault(),
                b.TemplateId,
                b.ProjectNumber,
                b.ProductNo,
                ProductName = b.ProjectTitle,
                b.CreatedOn,
                TemplateName = b.Template != null ? b.Template.Name : null,
                TemplateJson = b.Template != null ? b.Template.TemplateJson : null,
                // Fetch approval history
                LatestApproval = b.Approvals
                    .OrderByDescending(a => a.CreatedOn)
                    .Select(a => new
                    {
                        a.ApproverId,
                        ApproverName = dbContext.Employees
                            .Where(e => e.EmployeeId == a.ApproverId)
                            .Select(e => e.Name)
                            .FirstOrDefault(),
                        a.ApprovalStatus,
                        a.Comments,
                        a.CreatedOn
                    })
                    .FirstOrDefault()
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (header is null)
        {
            return null;
        }

        // 1. Fetch raw data from the database first
        var rawCategories = await dbContext.BudgetCategories
            .AsNoTracking()
            .Where(c => c.BudgetId == budgetId)
            .Include(c => c.Items) // Ensure child items are loaded
            .OrderBy(c => c.CategoryId)
            .ToListAsync(cancellationToken);

        // 2. Perform calculations and mapping in memory
        var categoryData = rawCategories.Select(c => new BudgetExportCategoryData(
            string.Empty,
            c.CategoryName,
            c.Items
                .OrderBy(i => i.ItemId)
                .Select(i => {
                    // Perform Math
                    var variance = i.Planned - i.Actual;
                    var percentage = i.Planned > 0 ? (i.Actual / i.Planned) * 100 : 0;

                    return new BudgetExportItemData(
                        string.Empty,                        // 1. ItemNumber
                        i.ItemName,                          // 2. ItemName
                        i.Planned,                           // 3. EstimatedAmount
                        i.Actual,                            // 4. ActualAmount
                        variance.ToString("N2"),             // 5. Variance
                        percentage.ToString("N2") + "%",     // 6. Percentage
                        string.Empty                         // 7. Remarks
                    );
                })
                .ToList()))
            .ToList();

        var template = BudgetTemplateExportModel.Parse(header.TemplateName, header.TemplateJson);
        var orderedCategories = BuildOrderedCategories(template, categoryData);

        var approvalDetails = header.LatestApproval != null
    ? new BudgetApprovalDetails(
        header.BudgetId,
        header.LatestApproval.ApproverId,
        header.LatestApproval.ApproverName ?? "Unknown",
        header.LatestApproval.ApprovalStatus.ToString(),
        header.LatestApproval.Comments,
        header.LatestApproval.CreatedOn) // Mapping the date here
    : new BudgetApprovalDetails(
        header.BudgetId,
        0,
        "N/A",
        "Pending",
        "No approval found",
        null); // No date for pending

        var exportSource = new BudgetExportSource(
            header.BudgetId,
            header.EmployeeId,
            header.PreparedBy,
            header.TemplateId,
            header.ProjectNumber,
            header.ProductNo,
            header.ProductName,
            header.CreatedOn,
            header.CreatedOn,
            string.IsNullOrWhiteSpace(template.TemplateName) ? "Project Cost Report" : template.TemplateName,
            header.TemplateJson,
            approvalDetails,
            orderedCategories);

        return workbookBuilder.Build(exportSource);
    }

    public async Task<BudgetExportSource?> GetReportDataAsync(int budgetId, CancellationToken cancellationToken)
    {
        // 1. Fetch Header Data (Oracle/DB)
        var header = await dbContext.Budgets
           .AsNoTracking()
           .Where(b => b.BudgetId == budgetId && b.IsActive)
           .Select(b => new
           {
               b.BudgetId,
               b.EmployeeId,
               PreparedBy = dbContext.Employees
                   .Where(e => e.EmployeeId == b.EmployeeId)
                   .Select(e => e.Name)
                   .FirstOrDefault(),
               b.TemplateId,
               b.ProjectNumber,
               b.ProductNo,
               ProductName = b.ProjectTitle,
               b.CreatedOn,
               TemplateName = b.Template != null ? b.Template.Name : null,
               TemplateJson = b.Template != null ? b.Template.TemplateJson : null,
               LatestApproval = b.Approvals
                   .OrderByDescending(a => a.CreatedOn)
                   .Select(a => new
                   {
                       a.ApproverId,
                       ApproverName = dbContext.Employees
                           .Where(e => e.EmployeeId == a.ApproverId)
                           .Select(e => e.Name)
                           .FirstOrDefault(),
                       a.ApprovalStatus,
                       a.Comments,
                       a.CreatedOn
                   })
                   .FirstOrDefault()
           })
           .SingleOrDefaultAsync(cancellationToken);

        if (header is null) return null;

        // 2. Fetch Category/Item Data separately to avoid SQL translation issues with formatting
        var rawCategories = await dbContext.BudgetCategories
            .AsNoTracking()
            .Where(c => c.BudgetId == budgetId)
            .Include(c => c.Items) // Ensure Items are loaded
            .OrderBy(c => c.CategoryId)
            .ToListAsync(cancellationToken);

        // 3. Map and Calculate Variance/Percentage in Memory (C#)
        var categoryData = rawCategories.Select(c => new BudgetExportCategoryData(
            string.Empty,
            c.CategoryName,
            c.Items
                .OrderBy(i => i.ItemId)
                .Select(i =>
                {
                    var variance = i.Planned - i.Actual;
                    var percentage = i.Planned > 0 ? (i.Actual / i.Planned) * 100 : 0;

                    return new BudgetExportItemData(
                        string.Empty,                        // ItemNumber
                        i.ItemName,                          // ItemName
                        i.Planned,                           // EstimatedAmount
                        i.Actual,                            // ActualAmount
                        variance.ToString("N2"),             // Variance
                        percentage.ToString("N2") + "%",     // Percentage
                        string.Empty                         // Remarks
                    );
                })
                .ToList()))
            .ToList();

        // 4. Build supporting models
        var template = BudgetTemplateExportModel.Parse(header.TemplateName, header.TemplateJson);
        var orderedCategories = BuildOrderedCategories(template, categoryData);

        var approvalDetails = header.LatestApproval != null
            ? new BudgetApprovalDetails(
                header.BudgetId,
                header.LatestApproval.ApproverId,
                header.LatestApproval.ApproverName ?? "Unknown",
                header.LatestApproval.ApprovalStatus.ToString(),
                header.LatestApproval.Comments,
                header.LatestApproval.CreatedOn)
            : new BudgetApprovalDetails(
                header.BudgetId, 0, "N/A", "Pending", "No approval found", null);

        // 5. Return the full source object
        return new BudgetExportSource(
            header.BudgetId,
            header.EmployeeId,
            header.PreparedBy,
            header.TemplateId,
            header.ProjectNumber,
            header.ProductNo,
            header.ProductName,
            header.CreatedOn,
            header.CreatedOn,
            string.IsNullOrWhiteSpace(template.TemplateName) ? "Project Cost Report" : template.TemplateName,
            header.TemplateJson,
            approvalDetails,
            orderedCategories);
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
                .Select((item, index) =>
                {
                    // Perform calculations
                    var variance = item.EstimatedAmount - item.ActualAmount;
                    var percentage = item.EstimatedAmount > 0
                        ? (item.ActualAmount / item.EstimatedAmount) * 100
                        : 0;

                    return new BudgetExportItemData(
                        $"{categoryNumber}.{index + 1}",      // 1. ItemNumber
                        item.ItemName,                        // 2. ItemName
                        item.EstimatedAmount,                 // 3. EstimatedAmount
                        item.ActualAmount,                    // 4. ActualAmount
                        variance.ToString("N2"),              // 5. Variance
                        percentage.ToString("N2") + "%",      // 6. Percentage
                        item.Remarks ?? string.Empty          // 7. Remarks
                    );
                })
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

            // Calculate Variance and Percentage
            decimal planned = matchedItem?.EstimatedAmount ?? 0m;
            decimal actual = matchedItem?.ActualAmount ?? 0m;
            decimal variance = planned - actual;
            decimal percentage = planned > 0 ? (actual / planned) * 100 : 0;

            orderedItems.Add(new BudgetExportItemData(
                $"{categoryNumber}.{itemNumber}",
                templateItem.Name,
                planned,
                actual,
                variance.ToString("N2"),
                percentage.ToString("N2") + "%",
                matchedItem?.Remarks ?? string.Empty));

            itemNumber++;
        }

        foreach (var fallbackItem in sourceCategory.Items)
        {
            var fallbackKey = BudgetExportNameNormalizer.BuildItemKey(sourceCategory.CategoryName, fallbackItem.ItemName);
            var alreadyAdded = orderedItems.Any(i =>
                BudgetExportNameNormalizer.Normalize(i.ItemName) == BudgetExportNameNormalizer.Normalize(fallbackItem.ItemName));

            if (alreadyAdded || (itemLookup.ContainsKey(fallbackKey) && templateCategory.Items.Any(t =>
                BudgetExportNameNormalizer.Normalize(t.Name) == BudgetExportNameNormalizer.Normalize(fallbackItem.ItemName))))
            {
                continue;
            }

            // Calculate Variance and Percentage for fallbacks
            decimal vDiff = fallbackItem.EstimatedAmount - fallbackItem.ActualAmount;
            decimal pPct = fallbackItem.EstimatedAmount > 0 ? (fallbackItem.ActualAmount / fallbackItem.EstimatedAmount) * 100 : 0;

            orderedItems.Add(new BudgetExportItemData(
                $"{categoryNumber}.{itemNumber}",
                fallbackItem.ItemName,
                fallbackItem.EstimatedAmount,
                fallbackItem.ActualAmount,
                vDiff.ToString("N2"),
                pPct.ToString("N2") + "%",
                fallbackItem.Remarks ?? string.Empty));

            itemNumber++;
        }


        return orderedItems;
    }
}
