using ClosedXML.Excel;

namespace Server.Features.BudgetExport;

public sealed class ExcelReportBuilder
{
    private const string CurrencyFormat = "#,##0.00";

    public BudgetExportWorkbook Build(BudgetExportSource source)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Project Cost Report");

        ConfigureWorksheet(worksheet);
        WriteHeaderSection(worksheet, source);
        var tableHeaderRow = WriteTableHeader(worksheet);
        var currentRow = tableHeaderRow + 1;
        var categoryRowNumbers = new List<int>();

        foreach (var category in source.Categories)
        {
            categoryRowNumbers.Add(currentRow);
            currentRow = WriteCategoryBlock(worksheet, currentRow, category);
        }

        WriteGrandTotalRow(worksheet, currentRow, categoryRowNumbers);
        ApplyBorders(worksheet, 1, currentRow, 1, 5);
        worksheet.Columns(1, 5).AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new BudgetExportWorkbook(
            BudgetExportFileName.Build(source.ProjectNumber, source.ProductNo),
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    private static void ConfigureWorksheet(IXLWorksheet worksheet)
    {
        worksheet.Column(1).Width = 48;
        worksheet.Column(2).Width = 18;
        worksheet.Column(3).Width = 18;
        worksheet.Column(4).Width = 18;
        worksheet.Column(5).Width = 24;
        worksheet.SheetView.FreezeRows(7);

        worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;
        worksheet.PageSetup.PaperSize = XLPaperSize.A4Paper;
        worksheet.PageSetup.FitToPages(1, 0);
        worksheet.PageSetup.Margins.Top = 0.4;
        worksheet.PageSetup.Margins.Bottom = 0.4;
        worksheet.PageSetup.Margins.Left = 0.25;
        worksheet.PageSetup.Margins.Right = 0.25;
        worksheet.PageSetup.CenterHorizontally = true;
    }

    private static void WriteHeaderSection(IXLWorksheet worksheet, BudgetExportSource source)
    {
        worksheet.Range("A1:E1").Merge().Value = source.ReportTitle;
        var titleRange = worksheet.Range("A1:E1");
        titleRange.Style.Font.Bold = true;
        titleRange.Style.Font.FontSize = 16;
        titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        titleRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#DCE6F1");

        WriteMetadataRow(worksheet, 2, "Rec. No", source.BudgetId.ToString(), "Start Date", source.StartDate.ToString("dd-MMM-yyyy"));
        WriteMetadataRow(worksheet, 3, "Page No", "1", "Product No", source.ProductNo);
        WriteMetadataRow(worksheet, 4, "Product Name", source.ProductName, "NPD No", source.ProjectNumber);
        WriteMetadataRow(worksheet, 5, "Project No", source.ProjectNumber, "Generated On", DateTime.UtcNow.ToString("dd-MMM-yyyy HH:mm 'UTC'"));
    }

    private static void WriteMetadataRow(
        IXLWorksheet worksheet,
        int rowNumber,
        string leftLabel,
        string leftValue,
        string rightLabel,
        string rightValue)
    {
        worksheet.Cell(rowNumber, 1).Value = leftLabel;
        worksheet.Cell(rowNumber, 2).Value = leftValue;
        worksheet.Cell(rowNumber, 3).Value = rightLabel;
        worksheet.Range(rowNumber, 4, rowNumber, 5).Merge().Value = rightValue;

        var labelRange = worksheet.Range(rowNumber, 1, rowNumber, 3);
        labelRange.Style.Font.Bold = true;
        labelRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F6FA");

        worksheet.Range(rowNumber, 1, rowNumber, 5).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
    }

    private static int WriteTableHeader(IXLWorksheet worksheet)
    {
        const int row = 7;

        worksheet.Cell(row, 1).Value = "Cost Breakup";
        worksheet.Cell(row, 2).Value = "Estimation Amount";
        worksheet.Cell(row, 3).Value = "Actual Amount";
        worksheet.Cell(row, 4).Value = "Variance";
        worksheet.Cell(row, 5).Value = "Remarks";

        var headerRange = worksheet.Range(row, 1, row, 5);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#B8CCE4");
        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        return row;
    }

    private static int WriteCategoryBlock(
        IXLWorksheet worksheet,
        int startRow,
        BudgetExportCategoryData category)
    {
        worksheet.Cell(startRow, 1).Value = $"{category.RowNumber} {category.CategoryName}";
        worksheet.Cell(startRow, 2).FormulaA1 = $"SUM(B{startRow + 1}:B{startRow + category.Items.Count})";
        worksheet.Cell(startRow, 3).FormulaA1 = $"SUM(C{startRow + 1}:C{startRow + category.Items.Count})";
        worksheet.Cell(startRow, 4).FormulaA1 = $"B{startRow}-C{startRow}";

        var categoryRange = worksheet.Range(startRow, 1, startRow, 5);
        categoryRange.Style.Font.Bold = true;
        categoryRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#EAF2F8");

        var row = startRow + 1;
        foreach (var item in category.Items)
        {
            worksheet.Cell(row, 1).Value = $"{item.RowNumber} {item.ItemName}";
            worksheet.Cell(row, 1).Style.Alignment.Indent = 1;
            worksheet.Cell(row, 2).Value = item.EstimatedAmount;
            worksheet.Cell(row, 3).Value = item.ActualAmount;
            worksheet.Cell(row, 4).FormulaA1 = $"B{row}-C{row}";
            worksheet.Cell(row, 5).Value = item.Remarks;
            row++;
        }

        ApplyCurrencyFormatting(worksheet.Range(startRow, 2, row - 1, 4));
        return row;
    }

    private static void WriteGrandTotalRow(
        IXLWorksheet worksheet,
        int rowNumber,
        IReadOnlyList<int> categoryRowNumbers)
    {
        worksheet.Cell(rowNumber, 1).Value = "Grand Total";
        worksheet.Cell(rowNumber, 2).FormulaA1 = BuildSummationFormula("B", categoryRowNumbers);
        worksheet.Cell(rowNumber, 3).FormulaA1 = BuildSummationFormula("C", categoryRowNumbers);
        worksheet.Cell(rowNumber, 4).FormulaA1 = $"B{rowNumber}-C{rowNumber}";

        var totalRange = worksheet.Range(rowNumber, 1, rowNumber, 5);
        totalRange.Style.Font.Bold = true;
        totalRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#D9EAD3");
        ApplyCurrencyFormatting(worksheet.Range(rowNumber, 2, rowNumber, 4));
    }

    private static string BuildSummationFormula(string columnName, IReadOnlyList<int> rowNumbers)
    {
        if (rowNumbers.Count == 0)
        {
            return "0";
        }

        var references = string.Join(',', rowNumbers.Select(rowNumber => $"{columnName}{rowNumber}"));
        return $"SUM({references})";
    }

    private static void ApplyCurrencyFormatting(IXLRange range)
    {
        range.Style.NumberFormat.Format = CurrencyFormat;
        range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
    }

    private static void ApplyBorders(IXLWorksheet worksheet, int startRow, int endRow, int startColumn, int endColumn)
    {
        var fullRange = worksheet.Range(startRow, startColumn, endRow, endColumn);
        fullRange.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
        fullRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
    }
}
