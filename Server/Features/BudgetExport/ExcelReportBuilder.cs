using ClosedXML.Excel;
using DocumentFormat.OpenXml.Bibliography;

namespace Server.Features.BudgetExport;

/// <summary>
/// Builds an Excel workbook that matches the Janatics "Project Cost Report"
/// PDF template (Form No: F/D&amp;D/07, Issue No: 4.0).
///
/// NuGet dependency: ClosedXML (>= 0.102)
/// </summary>
public sealed class ExcelReportBuilder
{
    // Use this to get the path relative to where the app is actually running
    private static readonly string LogoImagePath = Path.Combine(
        Directory.GetCurrentDirectory(),
        "wwwroot",
        "assets",
        "jana.png"
    );

    // ── Palette ─────────────────────────────────────────────────────────
    private static readonly XLColor DarkNavy = XLColor.FromHtml("#1F3864");
    private static readonly XLColor MidBlue = XLColor.FromHtml("#0393D3");
    private static readonly XLColor LightBlue = XLColor.FromHtml("#BDD7EE");
    private static readonly XLColor PaleBlue = XLColor.FromHtml("#DEEAF1");
    private static readonly XLColor White = XLColor.White;
    private static readonly XLColor Black = XLColor.Black;
    private static readonly XLColor InputBlue = XLColor.FromHtml("#00008B");
    private static readonly XLColor ActualGreen = XLColor.FromHtml("#006400");
    private static readonly XLColor VarRed = XLColor.FromHtml("#8B0000");

    // ── Column indices (1-based, ClosedXML convention) ──────────────────
    // A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8
    // Layout:
    //  A      : Cat #  (narrow)
    //  B      : Sub #  (narrow)
    //  C–D    : Description (merged, wide)
    //  E      : Estimated Amount
    //  F      : Actual Amount
    //  G      : Variance
    //  H      : Remarks
    private const int ColCatNo = 1;  // A
    private const int ColSubNo = 2;  // B
    private const int ColDescL = 3;  // C  ─┐ description merged
    private const int ColDescR = 4;  // D  ─┘
    private const int ColEst = 5;  // E
    private const int ColAct = 6;  // F
    private const int ColVar = 7;  // G
    private const int ColRem = 8;  // H

    private const string AmtFmt = @"#,##0;(#,##0);""-""";

    // ════════════════════════════════════════════════════════════════════
    public BudgetExportWorkbook Build(BudgetExportSource source)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("Project Cost Report");

        SetColumnWidths(ws);
        int row = 1;

        row = WriteBanner(ws, row, source);          // rows 1-4  : logo / meta
        row = WriteColumnHeaders(ws, row);           // row  5    : table header
        var (directRows, row2) = WriteCategories(ws, row, source.Categories);
        row = row2;
        var (indirectRows, row3) = WriteIndirectCosts(ws, row, source.Categories);
        row = row3;
        row = WriteTotalProject(ws, row, directRows, indirectRows);
        row = WriteRemarksBlock(ws, row, source);
        row = WriteFooterSignature(ws, row, source);
        WriteFormMetadata(ws, row);

        ConfigurePrintSettings(ws, source);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);

        return new BudgetExportWorkbook(
            ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"ProjectCostReport_{source.ProjectNumber}_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    // ════════════════════════════════════════════════════════════════════
    // COLUMN WIDTHS
    // ════════════════════════════════════════════════════════════════════
    private static void SetColumnWidths(IXLWorksheet ws)
    {
        ws.Column(ColCatNo).Width = 10;
        ws.Column(ColSubNo).Width = 7;
        ws.Column(ColDescL).Width = 30;
        ws.Column(ColDescR).Width = 20;
        ws.Column(ColEst).Width = 18;
        ws.Column(ColAct).Width = 18;
        ws.Column(ColVar).Width = 16;
        ws.Column(ColRem).Width = 26;
    }

    // ════════════════════════════════════════════════════════════════════
    // BANNER  (rows 1–4)
    // ════════════════════════════════════════════════════════════════════
    private static int WriteBanner(IXLWorksheet ws, int row, BudgetExportSource source)
    {
        // Row 1 — Company name | Report title | Rec/Date/Page box
        ws.Row(row).Height = 30; // Slightly taller for better logo fit

        var company = ws.Range(row, ColCatNo, row, ColSubNo).Merge();

        // 🚩 Check if file exists to prevent DirectoryNotFound/FileNotFound exceptions
        if (File.Exists(LogoImagePath))
        {
            var picture = ws.AddPicture(LogoImagePath)
                            .MoveTo(company.FirstCell(), 6, 9); // 10px from left, 3px from top

            // Set height explicitly to fit your Row Height (26)
            picture.Height = 22;
            picture.Width = 120;

            // Automatically scale width to maintain the original aspect ratio
            picture.ScaleWidth(1.0);
        }
        else
        {
            // Fallback text if the image is missing
            company.Value = "JANATICS";
        }

        Style(company, White, White, 16, bold: true, hAlign: XLAlignmentHorizontalValues.Center);
        FullBorder(company);

        var title = ws.Range(row, ColDescL, row, ColVar).Merge();
        title.Value = "PROJECT COST REPORT";
        Style(title, MidBlue, White, 14, bold: true, hAlign: XLAlignmentHorizontalValues.Center);
        FullBorder(title);

        // Rec No / Date / Page No — stacked in column H (rows 1-3)
        WriteMetaBox(ws, row, $"Rec No : {source.BudgetId}");
        row++;

        // Row 2 — Product No
        string currentDate = DateTime.Now.ToString("dd.MM.yyyy");
        ws.Row(row).Height = 18;
        WriteMetaBox(ws, row, $"Date : {currentDate}");
        WriteLabelValue(ws, row, "Product No :", source.ProductNo);
        row++;

        // Row 3 — Product Name
        ws.Row(row).Height = 18;
        WriteMetaBox(ws, row, "Page No. : 1");
        WriteLabelValue(ws, row, "Product Name :", source.ProductName);
        row++;

        // Row 4 — NPD No
        ws.Row(row).Height = 18;
        WriteLabelValue(ws, row, "NPD No. :", source.ProjectNumber);
        // H4 — blank border continuation
        var h4 = ws.Cell(row, ColRem);
        h4.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        row++;

        return row;
    }

    private static void WriteMetaBox(IXLWorksheet ws, int row, string label)
    {
        var c = ws.Cell(row, ColRem);
        c.Value = label;
        c.Style.Font.FontName = "Arial";
        c.Style.Font.FontSize = 8;
        c.Style.Font.Bold = true;
        c.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        c.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        c.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static void WriteLabelValue(IXLWorksheet ws, int row, string label, string value)
    {
        var lbl = ws.Range(row, ColCatNo, row, ColSubNo).Merge();
        lbl.Value = label;
        lbl.Style.Font.FontName = "Arial";
        lbl.Style.Font.FontSize = 9;
        lbl.Style.Font.Bold = true;
        lbl.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        lbl.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        lbl.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        var val = ws.Range(row, ColDescL, row, ColVar).Merge();
        val.Value = value;
        val.Style.Font.FontName = "Arial";
        val.Style.Font.FontSize = 9;
        val.Style.Font.FontColor = MidBlue;
        val.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        val.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        val.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    // ════════════════════════════════════════════════════════════════════
    // COLUMN HEADERS  (row 5)
    // ════════════════════════════════════════════════════════════════════
    private static int WriteColumnHeaders(IXLWorksheet ws, int row)
    {
        ws.Row(row).Height = 32;

        void Hdr(int c1, int c2, string text)
        {
            var r = ws.Range(row, c1, row, c2).Merge();
            r.Value = text;
            Style(r, DarkNavy, White, 9, bold: true,
                  hAlign: XLAlignmentHorizontalValues.Center,
                  wrap: true);
            FullBorder(r);
        }

        Hdr(ColCatNo, ColSubNo, "Cost\nBreak up");
        Hdr(ColDescL, ColDescR, "Description");
        Hdr(ColEst, ColEst, "Estimated\nAmount (₹)");
        Hdr(ColAct, ColAct, "Actual\nAmount (₹)");
        Hdr(ColVar, ColVar, "Variance\n(₹)");
        Hdr(ColRem, ColRem, "Remarks");

        return row + 1;
    }

    // ════════════════════════════════════════════════════════════════════
    // CATEGORIES + ITEMS
    // ════════════════════════════════════════════════════════════════════
    /// <summary>
    /// Writes all non-indirect categories (1–10) and returns the list of
    /// Excel row numbers that contain item data (for SUM formulas) plus the
    /// next available row number.
    /// </summary>
    private static (List<int> itemRows, int nextRow) WriteCategories(
        IXLWorksheet ws,
        int startRow,
        IReadOnlyList<BudgetExportCategoryData> categories)
    {
        var itemRows = new List<int>();
        int row = startRow;

        // Indirect-cost categories are rendered separately in WriteIndirectCosts
        var directCategories = categories
            .Where(c => !IsIndirectCategory(c.CategoryName))
            .ToList();

        foreach (var cat in directCategories)
        {
            row = WriteCategoryHeader(ws, row, cat.CategoryNumber, cat.CategoryName);

            bool shade = false;
            foreach (var item in cat.Items)
            {
                WriteItemRow(ws, row, item, shade);
                itemRows.Add(row);
                shade = !shade;
                row++;
            }
        }

        return (itemRows, row);
    }

    private static (List<int> indirectRows, int nextRow) WriteIndirectCosts(
        IXLWorksheet ws,
        int startRow,
        IReadOnlyList<BudgetExportCategoryData> categories)
    {
        var indirectRows = new List<int>();
        int row = startRow;

        var indirectCategory = categories.FirstOrDefault(c => IsIndirectCategory(c.CategoryName));
        if (indirectCategory is null)
            return (indirectRows, row);

        // Category-12 header
        row = WriteCategoryHeader(ws, row, indirectCategory.CategoryNumber, indirectCategory.CategoryName);

        bool shade = false;
        foreach (var item in indirectCategory.Items)
        {
            WriteItemRow(ws, row, item, shade);
            indirectRows.Add(row);
            shade = !shade;
            row++;
        }

        return (indirectRows, row);
    }

    private static bool IsIndirectCategory(string name) =>
        name.Contains("Indirect", StringComparison.OrdinalIgnoreCase);

    // ── Category header row ──────────────────────────────────────────────
    private static int WriteCategoryHeader(IXLWorksheet ws, int row, string number, string name)
    {
        ws.Row(row).Height = 20;

        var num = ws.Range(row, ColCatNo, row, ColSubNo).Merge();
        num.Value = number;
        Style(num, MidBlue, White, 9, bold: true, hAlign: XLAlignmentHorizontalValues.Center);
        FullBorder(num);

        var desc = ws.Range(row, ColDescL, row, ColDescR).Merge();
        desc.Value = name;
        Style(desc, MidBlue, White, 9, bold: true, hAlign: XLAlignmentHorizontalValues.Left);
        FullBorder(desc);

        foreach (var col in new[] { ColEst, ColAct, ColVar, ColRem })
        {
            var c = ws.Cell(row, col);
            c.Style.Fill.BackgroundColor = MidBlue;
            c.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            c.Style.Border.OutsideBorderColor = Black;
        }

        return row + 1;
    }

    // ── Item data row ────────────────────────────────────────────────────
    private static void WriteItemRow(IXLWorksheet ws, int row, BudgetExportItemData item, bool shade)
    {
        ws.Row(row).Height = 17;
        var bg = shade ? PaleBlue : White;

        // A – blank spacer
        var a = ws.Cell(row, ColCatNo);
        a.Style.Fill.BackgroundColor = bg;
        a.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // B – sub-number
        var b = ws.Cell(row, ColSubNo);
        b.Value = item.ItemNumber;
        b.Style.Font.FontName = "Arial";
        b.Style.Font.FontSize = 8;
        b.Style.Fill.BackgroundColor = bg;
        b.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        b.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        b.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // C–D – description (merged)
        var desc = ws.Range(row, ColDescL, row, ColDescR).Merge();
        desc.Value = item.ItemName;
        desc.Style.Font.FontName = "Arial";
        desc.Style.Font.FontSize = 9;
        desc.Style.Fill.BackgroundColor = bg;
        desc.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        desc.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        desc.Style.Alignment.WrapText = true;
        FullBorder(desc);

        // E – Estimated
        var est = ws.Cell(row, ColEst);
        est.Value = item.EstimatedAmount;
        est.Style.Font.FontName = "Arial";
        est.Style.Font.FontSize = 9;
        est.Style.Font.FontColor = InputBlue;
        est.Style.NumberFormat.Format = AmtFmt;
        est.Style.Fill.BackgroundColor = bg;
        est.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        est.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        est.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // F – Actual
        var act = ws.Cell(row, ColAct);
        act.Value = item.ActualAmount;
        act.Style.Font.FontName = "Arial";
        act.Style.Font.FontSize = 9;
        act.Style.Font.FontColor = ActualGreen;
        act.Style.NumberFormat.Format = AmtFmt;
        act.Style.Fill.BackgroundColor = bg;
        act.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        act.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        act.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // G – Variance formula
        var variance = ws.Cell(row, ColVar);
        variance.FormulaA1 = $"=E{row}-F{row}";
        variance.Style.Font.FontName = "Arial";
        variance.Style.Font.FontSize = 9;
        variance.Style.Font.FontColor = VarRed;
        variance.Style.NumberFormat.Format = AmtFmt;
        variance.Style.Fill.BackgroundColor = bg;
        variance.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        variance.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        variance.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // H – Remarks
        var rem = ws.Cell(row, ColRem);
        rem.Value = item.Remarks ?? string.Empty;
        rem.Style.Font.FontName = "Arial";
        rem.Style.Font.FontSize = 8;
        rem.Style.Fill.BackgroundColor = bg;
        rem.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        rem.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        rem.Style.Alignment.WrapText = true;
        rem.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    // ════════════════════════════════════════════════════════════════════
    // TOTAL ROWS
    // ════════════════════════════════════════════════════════════════════

    private static int WriteTotalProject(IXLWorksheet ws, int row,
        List<int> directRows, List<int> indirectRows)
    {
        ws.Row(row).Height = 24;
        var allRows = directRows.Concat(indirectRows).ToList();
        return WriteTotalRow(ws, row, "-", "Total Project Cost", allRows, fontSize: 11);
    }

    private static int WriteTotalRow(IXLWorksheet ws, int row, string number, string label,
        List<int> sourceRows, int fontSize)
    {
        var numCell = ws.Range(row, ColCatNo, row, ColSubNo).Merge();
        numCell.Value = number;
        Style(numCell, DarkNavy, White, fontSize, bold: true, hAlign: XLAlignmentHorizontalValues.Center);
        FullBorder(numCell);

        var desc = ws.Range(row, ColDescL, row, ColDescR).Merge();
        desc.Value = label;
        Style(desc, DarkNavy, White, fontSize, bold: true, hAlign: XLAlignmentHorizontalValues.Left);
        FullBorder(desc);

        string estFormula = BuildSumFormula(sourceRows, ColEst);
        string actFormula = BuildSumFormula(sourceRows, ColAct);

        WriteTotalAmountCell(ws, row, ColEst, estFormula, fontSize);
        WriteTotalAmountCell(ws, row, ColAct, actFormula, fontSize);

        var variance = ws.Cell(row, ColVar);
        variance.FormulaA1 = $"=E{row}-F{row}";
        variance.Style.Font.FontName = "Arial";
        variance.Style.Font.FontSize = fontSize;
        variance.Style.Font.Bold = true;
        variance.Style.Font.FontColor = White;
        variance.Style.NumberFormat.Format = AmtFmt;
        variance.Style.Fill.BackgroundColor = DarkNavy;
        variance.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        variance.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        variance.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        variance.Style.Border.OutsideBorderColor = Black;

        var rem = ws.Cell(row, ColRem);
        rem.Style.Fill.BackgroundColor = DarkNavy;
        rem.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        rem.Style.Border.OutsideBorderColor = Black;

        return row + 1;
    }

    private static void WriteTotalAmountCell(IXLWorksheet ws, int row, int col,
        string formula, int fontSize)
    {
        var c = ws.Cell(row, col);
        c.FormulaA1 = formula;
        c.Style.Font.FontName = "Arial";
        c.Style.Font.FontSize = fontSize;
        c.Style.Font.Bold = true;
        c.Style.Font.FontColor = White;
        c.Style.NumberFormat.Format = AmtFmt;
        c.Style.Fill.BackgroundColor = DarkNavy;
        c.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        c.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        c.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        c.Style.Border.OutsideBorderColor = Black;
    }

    private static string BuildSumFormula(List<int> rows, int col)
    {
        if (rows.Count == 0) return "0";
        var colLetter = ColumnLetter(col);
        var refs = rows.Select(r => $"{colLetter}{r}");
        return "=" + string.Join("+", refs);
    }

    // ════════════════════════════════════════════════════════════════════
    // REMARKS / DECISION BLOCK
    // ════════════════════════════════════════════════════════════════════
    private static int WriteRemarksBlock(IXLWorksheet ws, int row, BudgetExportSource source)
    {
        ws.Row(row).Height = 44;

        var cell = ws.Range(row, ColCatNo, row, ColRem).Merge();
        cell.Value = $"REMARKS / DECISION: {source.Approvals.Comments}";
        cell.Style.Font.FontName = "Arial";
        cell.Style.Font.FontSize = 9;
        cell.Style.Font.Bold = true;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
        cell.Style.Alignment.WrapText = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
        cell.Style.Border.OutsideBorderColor = Black;

        return row + 1;
    }

    // ════════════════════════════════════════════════════════════════════
    // FOOTER — Prepared By / Approved By
    // ════════════════════════════════════════════════════════════════════
    private static int WriteFooterSignature(IXLWorksheet ws, int row, BudgetExportSource source)
    {
        ws.Row(row).Height = 28;

        // 1. Prepared By
        var prep = ws.Range(row, ColCatNo, row, ColDescR).Merge();
        prep.Value = $"Prepared By : {source.PreparedBy}";
        StyleFooterBox(prep, LightBlue);
        prep.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // 2. Approved On (Column E) - Reducing padding/spacing here
        var approvedOn = ws.Cell(row, ColEst);
        var dateDisplay = source.Approvals.ApprovedOn?.ToString("yyyy-MM-dd") ?? "N/A";
        approvedOn.Value = $"Approved On: {dateDisplay}"; // Shortened prefix to save space
        StyleFooterBox(approvedOn.AsRange(), LightBlue);

        // Crucial for reducing space/overflow in the middle cell:
        approvedOn.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        approvedOn.Style.Font.FontSize = 8.5; // Slightly smaller to prevent clipping
        approvedOn.Style.Alignment.ShrinkToFit = true;

        // 3. Approved By
        var appr = ws.Range(row, ColAct, row, ColRem).Merge();
        appr.Value = $"Approved By : {source.Approvals.ApproverName}";
        StyleFooterBox(appr, LightBlue);
        appr.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        return row + 1;
    }


    private static void StyleFooterBox(IXLRange range, XLColor bg)
    {
        range.Style.Font.FontName = "Arial";
        range.Style.Font.FontSize = 10;
        range.Style.Font.Bold = true;
        range.Style.Fill.BackgroundColor = bg;
        range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
        range.Style.Border.OutsideBorderColor = XLColor.Black;
    }

    // ── Form metadata ─────────────────────────────────────────────────────
    private static void WriteFormMetadata(IXLWorksheet ws, int row)
    {
        ws.Row(row).Height = 14;

        // Generate the dynamic string
        string currentDate = DateTime.Now.ToString("dd.MM.yyyy");
        string leftText = $"Form No: F/D&D/07          Issue No: 4.0          Date: {currentDate}";

        var left = ws.Range(row, ColCatNo, row, ColDescR).Merge();
        left.Value = leftText;
        left.Style.Font.FontName = "Arial";
        left.Style.Font.FontSize = 7;
        left.Style.Font.Italic = true;
        left.Style.Font.FontColor = XLColor.FromHtml("#666666");
        left.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        left.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        var right = ws.Range(row, ColAct, row, ColRem).Merge();
        right.Value = "Controlled Copy";
        right.Style.Font.FontName = "Arial";
        right.Style.Font.FontSize = 7;
        right.Style.Font.Italic = true;
        right.Style.Font.FontColor = XLColor.FromHtml("#666666");
        right.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        right.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
    }

    // ════════════════════════════════════════════════════════════════════
    // PRINT / PAGE SETUP
    // ════════════════════════════════════════════════════════════════════
    private static void ConfigurePrintSettings(IXLWorksheet ws, BudgetExportSource source)
    {
        // Paper & orientation
        ws.PageSetup.PaperSize = XLPaperSize.A4Paper;
        ws.PageSetup.PageOrientation = XLPageOrientation.Portrait;
        ws.PageSetup.PagesWide = 1;
        ws.PageSetup.PagesTall = 0;   // let height grow naturally

        // Margins (inches)
        ws.PageSetup.Margins.Left = 0.5;
        ws.PageSetup.Margins.Right = 0.4;
        ws.PageSetup.Margins.Top = 0.9;
        ws.PageSetup.Margins.Bottom = 0.9;
        ws.PageSetup.Margins.Header = 0.4;
        ws.PageSetup.Margins.Footer = 0.4;

        // ── Printed page heading ────────────────────────────────────────
        // Left  : Jana Logo image
        // Center: "Project Cost" (as requested)
        // Right : Product info
        ws.PageSetup.Header.Left.AddNewLine();
        ws.PageSetup.Header.Left.AddText($"Product No: {source.ProductNo}",
            XLHFOccurrence.AllPages);

        ws.PageSetup.Header.Center.AddText("Project Cost",
            XLHFOccurrence.AllPages);

        ws.PageSetup.Header.Right.AddText($"Rec No:",
            XLHFOccurrence.AllPages);
        ws.PageSetup.Header.Right.AddNewLine();
        ws.PageSetup.Header.Right.AddText($"Date: {source.CreatedOn:dd-MMM-yyyy}",
            XLHFOccurrence.AllPages);
        ws.PageSetup.Header.Right.AddNewLine();
        ws.PageSetup.Header.Right.AddText("Page &P of &N",
            XLHFOccurrence.AllPages);

        // ── Printed page footer ─────────────────────────────────────────
        // Left  : Prepared By
        // Center: Form reference
        // Right : Approved By
        ws.PageSetup.Footer.Left.AddText("Prepared By : ____________________",
            XLHFOccurrence.AllPages);

        string currentDate = DateTime.Now.ToString("dd.MM.yyyy");
        ws.PageSetup.Footer.Center.AddText(
            $"Form No: F/D&D/07  |  Issue No: 4.0  |  Date:  {currentDate}",
            XLHFOccurrence.AllPages);

        ws.PageSetup.Footer.Right.AddText("Approved By : ____________________",
            XLHFOccurrence.AllPages);

        // Repeat column-header rows (1–5) at the top of every printed page
        ws.PageSetup.SetRowsToRepeatAtTop(1, 5);
    }

    // ════════════════════════════════════════════════════════════════════
    // STYLE HELPERS
    // ════════════════════════════════════════════════════════════════════
    private static void Style(IXLRange range, XLColor bg, XLColor fg, int fontSize,
        bool bold = false,
        XLAlignmentHorizontalValues hAlign = XLAlignmentHorizontalValues.Left,
        bool wrap = false)
    {
        range.Style.Fill.BackgroundColor = bg;
        range.Style.Font.FontName = "Arial";
        range.Style.Font.FontSize = fontSize;
        range.Style.Font.Bold = bold;
        range.Style.Font.FontColor = fg;
        range.Style.Alignment.Horizontal = hAlign;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        range.Style.Alignment.WrapText = wrap;
    }

    private static void FullBorder(IXLRange range)
    {
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        range.Style.Border.OutsideBorderColor = XLColor.Black;
        range.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        range.Style.Border.InsideBorderColor = XLColor.Black;
    }

    private static string ColumnLetter(int columnIndex)
    {
        var letter = string.Empty;
        while (columnIndex > 0)
        {
            int mod = (columnIndex - 1) % 26;
            letter = (char)('A' + mod) + letter;
            columnIndex = (columnIndex - 1) / 26;
        }
        return letter;
    }
}
