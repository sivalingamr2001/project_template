using System.Text.Json;

namespace Server.Features.BudgetExport;

public sealed record BudgetExportWorkbook(
    string FileName,
    byte[] Content,
    string ContentType);

public sealed record BudgetExportSource(
    int BudgetId,
    int? TemplateId,
    string ProjectNumber,
    string ProductNo,
    string ProductName,
    DateTime StartDate,
    string ReportTitle,
    string? TemplateJson,
    IReadOnlyList<BudgetExportCategoryData> Categories);

public sealed record BudgetExportCategoryData(
    string RowNumber,
    string CategoryName,
    IReadOnlyList<BudgetExportItemData> Items);

public sealed record BudgetExportItemData(
    string RowNumber,
    string ItemName,
    decimal EstimatedAmount,
    decimal ActualAmount,
    string Remarks);

public sealed record BudgetTemplateExportModel(
    string TemplateName,
    IReadOnlyList<BudgetTemplateCategoryExportModel> Categories)
{
    public static BudgetTemplateExportModel Parse(string? templateName, string? templateJson)
    {
        if (string.IsNullOrWhiteSpace(templateJson))
        {
            return new BudgetTemplateExportModel(
                string.IsNullOrWhiteSpace(templateName) ? "Project Cost Report" : templateName,
                []);
        }

        try
        {
            using var document = JsonDocument.Parse(templateJson);
            var root = document.RootElement;

            var resolvedTemplateName = templateName;
            JsonElement categoriesElement;

            if (root.ValueKind == JsonValueKind.Array)
            {
                categoriesElement = root;
            }
            else if (root.ValueKind == JsonValueKind.Object &&
                     root.TryGetProperty("categories", out var objectCategories))
            {
                categoriesElement = objectCategories;

                if (string.IsNullOrWhiteSpace(resolvedTemplateName) &&
                    root.TryGetProperty("templateName", out var templateNameElement))
                {
                    resolvedTemplateName = templateNameElement.GetString();
                }
            }
            else
            {
                return new BudgetTemplateExportModel(
                    string.IsNullOrWhiteSpace(templateName) ? "Project Cost Report" : templateName,
                    []);
            }

            var categories = new List<BudgetTemplateCategoryExportModel>();

            foreach (var categoryElement in categoriesElement.EnumerateArray())
            {
                var categoryName = GetCategoryName(categoryElement);
                if (string.IsNullOrWhiteSpace(categoryName))
                {
                    continue;
                }

                var items = new List<BudgetTemplateItemExportModel>();
                if (TryGetItemsElement(categoryElement, out var itemsElement))
                {
                    foreach (var itemElement in itemsElement.EnumerateArray())
                    {
                        var itemName = GetItemName(itemElement);
                        if (string.IsNullOrWhiteSpace(itemName))
                        {
                            continue;
                        }

                        items.Add(new BudgetTemplateItemExportModel(itemName));
                    }
                }

                if (TryGetSubCategoriesElement(categoryElement, out var subCategoriesElement))
                {
                    foreach (var subCategoryElement in subCategoriesElement.EnumerateArray())
                    {
                        var subCategoryName = GetItemName(subCategoryElement);
                        if (string.IsNullOrWhiteSpace(subCategoryName))
                        {
                            continue;
                        }

                        items.Add(new BudgetTemplateItemExportModel(subCategoryName));

                        if (!TryGetItemsElement(subCategoryElement, out var subCategoryItemsElement))
                        {
                            continue;
                        }

                        foreach (var subItemElement in subCategoryItemsElement.EnumerateArray())
                        {
                            var subItemName = GetItemName(subItemElement);
                            if (string.IsNullOrWhiteSpace(subItemName))
                            {
                                continue;
                            }

                            items.Add(new BudgetTemplateItemExportModel(subItemName));
                        }
                    }
                }

                categories.Add(new BudgetTemplateCategoryExportModel(categoryName, items));
            }

            return new BudgetTemplateExportModel(
                string.IsNullOrWhiteSpace(resolvedTemplateName) ? "Project Cost Report" : resolvedTemplateName,
                categories);
        }
        catch (JsonException)
        {
            return new BudgetTemplateExportModel(
                string.IsNullOrWhiteSpace(templateName) ? "Project Cost Report" : templateName,
                []);
        }
    }

    private static string? GetCategoryName(JsonElement categoryElement)
    {
        if (categoryElement.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (categoryElement.TryGetProperty("name", out var nameElement))
        {
            return nameElement.GetString()?.Trim();
        }

        if (categoryElement.TryGetProperty("category", out var categoryNameElement))
        {
            return categoryNameElement.GetString()?.Trim();
        }

        return null;
    }

    private static bool TryGetItemsElement(JsonElement categoryElement, out JsonElement itemsElement)
        => categoryElement.TryGetProperty("items", out itemsElement) && itemsElement.ValueKind == JsonValueKind.Array;

    private static bool TryGetSubCategoriesElement(JsonElement categoryElement, out JsonElement subCategoriesElement)
        => categoryElement.TryGetProperty("subCategories", out subCategoriesElement) && subCategoriesElement.ValueKind == JsonValueKind.Array;

    private static string? GetItemName(JsonElement itemElement)
    {
        return itemElement.ValueKind switch
        {
            JsonValueKind.String => itemElement.GetString()?.Trim(),
            JsonValueKind.Object when itemElement.TryGetProperty("name", out var nameElement) => nameElement.GetString()?.Trim(),
            JsonValueKind.Object when itemElement.TryGetProperty("category", out var categoryElement) => categoryElement.GetString()?.Trim(),
            _ => null
        };
    }
}

public sealed record BudgetTemplateCategoryExportModel(
    string Name,
    IReadOnlyList<BudgetTemplateItemExportModel> Items);

public sealed record BudgetTemplateItemExportModel(string Name);

public static class BudgetExportNameNormalizer
{
    public static string Normalize(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalizedChars = value
            .Trim()
            .ToLowerInvariant()
            .Select(c => char.IsLetterOrDigit(c) ? c : ' ')
            .ToArray();

        return string.Join(
            ' ',
            new string(normalizedChars)
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
    }

    public static string BuildItemKey(string categoryName, string itemName)
        => $"{Normalize(categoryName)}|{Normalize(itemName)}";

    public static string BuildCategoryKey(string categoryName)
        => Normalize(categoryName);
}

public static class BudgetExportFileName
{
    public static string Build(string projectNumber, string productNo)
    {
        var safeProject = string.IsNullOrWhiteSpace(projectNumber) ? "budget" : Sanitize(projectNumber);
        var safeProduct = string.IsNullOrWhiteSpace(productNo) ? "report" : Sanitize(productNo);
        return $"{safeProject}-{safeProduct}-project-cost-report.xlsx";
    }

    private static string Sanitize(string value)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var safeChars = value.Select(ch => invalidChars.Contains(ch) ? '-' : ch).ToArray();
        return new string(safeChars);
    }
}
