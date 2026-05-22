using Application.DTOs.Response;
using ClosedXML.Excel;

namespace Application.Implementation;

/// <summary>
/// Builds an Excel workbook that matches the Janatics 
/// "Requisition for Component Development" PDF template
/// (Form No: F/D&D/21, Issue No: 4.2).
///
/// NuGet dependency: ClosedXML (>= 0.102)
/// </summary>
public sealed class RequisitionExcelReportBuilder
{
    // ── Logo path ───────────────────────────────────────────────────────
    private static readonly string LogoImagePath = Path.Combine(
        Directory.GetCurrentDirectory(),
        "wwwroot",
        "assets",
        "jana.png"
    );

    // ── Palette ─────────────────────────────────────────────────────────
    private static readonly XLColor DarkNavy = XLColor.FromHtml("#1F3864");
    private static readonly XLColor LightBlue = XLColor.FromHtml("#BDD7EE");
    private static readonly XLColor PaleBlue = XLColor.FromHtml("#DEEAF1");
    private static readonly XLColor White = XLColor.White;
    private static readonly XLColor Black = XLColor.Black;
    private static readonly XLColor InputBlue = XLColor.FromHtml("#00008B");

    // ── Column indices (1-based, ClosedXML convention) ──────────────────
    // A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8  I=9
    private const int ColA = 1;
    private const int ColB = 2;
    private const int ColC = 3;
    private const int ColD = 4;
    private const int ColE = 5;
    private const int ColF = 6;
    private const int ColG = 7;
    private const int ColH = 8;
    private const int ColI = 9;

    private const string DateFmt = @"dd.MM.yyyy";

    // ════════════════════════════════════════════════════════════════════
    public RequisitionExportWorkbook Build(RequisitionExportSource source)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("CompDev_Requisition");

        SetColumnWidths(ws);
        int row = 1;

        row = WriteBanner(ws, row, source);
        row = WriteHeaderInfo(ws, row, source);
        row = WriteColumnHeaders(ws, row);
        row = WriteLineItems(ws, row, source.LineItems);
        row = WriteRemarksBlock(ws, row);
        row = WriteSignatureBlock(ws, row, source);
        WriteFormMetadata(ws, row);

        // Auto-fit columns after all data is written
        AutoFitColumns(ws);

        ConfigurePrintSettings(ws, source);

        using var ms = new MemoryStream();
        wb.SaveAs(ms);

        return new RequisitionExportWorkbook(
            ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"Requisition_{source.RecNo}_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    // ════════════════════════════════════════════════════════════════════
    // COLUMN WIDTHS (initial, will auto-fit later)
    // ════════════════════════════════════════════════════════════════════
    private static void SetColumnWidths(IXLWorksheet ws)
    {
        ws.Column(ColA).Width = 8;   // S.No / labels
        ws.Column(ColB).Width = 12;  // Part No / values
        ws.Column(ColC).Width = 8;   // Rev
        ws.Column(ColD).Width = 14;  // Part Name left
        ws.Column(ColE).Width = 14;  // Part Name right
        ws.Column(ColF).Width = 8;   // Qty
        ws.Column(ColG).Width = 14;  // Required Date
        ws.Column(ColH).Width = 14;  // Committed date
        ws.Column(ColI).Width = 16;  // Actual completion date
    }

    // ════════════════════════════════════════════════════════════════════
    // AUTO-FIT COLUMNS based on content
    // ════════════════════════════════════════════════════════════════════
    private static void AutoFitColumns(IXLWorksheet ws)
    {
        // Auto-fit all columns but set minimum and maximum limits
        for (int col = ColA; col <= ColI; col++)
        {
            ws.Column(col).AdjustToContents();
            // Ensure minimum width
            if (ws.Column(col).Width < 6)
                ws.Column(col).Width = 6;
            // Cap maximum width for very long text
            if (ws.Column(col).Width > 40)
                ws.Column(col).Width = 40;
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // BANNER (rows 1–3) — Logo centered | Title wide | Meta on right
    // ════════════════════════════════════════════════════════════════════
    private static int WriteBanner(IXLWorksheet ws, int row, RequisitionExportSource source)
    {
        // Row 1 — Logo (A-C) | Title (D-H) | Rec.No. (I)
        ws.Row(row).Height = 12;

        // Logo area — centered, cols A-C
        var logoArea = ws.Range(row, ColA, row + 2, ColC).Merge();
        if (File.Exists(LogoImagePath))
        {
            // Reduced width from 140 to 110
            int imgWidth = 180;
            int imgHeight = 40;

            var picture = ws.AddPicture(LogoImagePath);

            // Center the smaller picture inside the 3-row merged cell block
            // Adjust these pixel offsets slightly if your row heights vary
            picture.MoveTo(logoArea.FirstCell(), 6, 18);
            picture.Width = imgWidth;
            picture.Height = imgHeight;
        }
        else
        {
            logoArea.Value = "JANATICS";
            logoArea.Style.Font.FontSize = 8;
            logoArea.Style.Font.Bold = true;
        }
        logoArea.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        logoArea.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        logoArea.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Title area — Wide form name space extending up to Column H
        var title = ws.Range(row, ColD, row + 2, ColH).Merge();
        title.Value = "REQUISITION FOR\nCOMPONENT DEVELOPMENT";
        title.Style.Font.FontName = "Swiss";
        title.Style.Font.FontSize = 16;
        title.Style.Font.Bold = true;
        title.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        title.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        title.Style.Alignment.WrapText = true;
        title.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Meta box — Kept in column I, row 1: Rec.No.
        var metaRec = ws.Cell(row, ColI);
        metaRec.Value = $"Rec. No. : {source.RecNo}";
        StyleMetaCell(metaRec);
        row++;

        // Row 2 — Meta: Date
        ws.Row(row).Height = 22;
        var metaDate = ws.Cell(row, ColI);
        metaDate.Value = $"Date : {source.Date:dd.MM.yyyy}";
        StyleMetaCell(metaDate);
        row++;

        // Row 3 — Meta: Page No. (static "1 of 1")
        ws.Row(row).Height = 22;
        var metaPage = ws.Cell(row, ColI);
        metaPage.Value = "Page No. : 1 of 1";
        StyleMetaCell(metaPage);
        row++;

        // Add borders to logo area continuation rows
        for (int r = row - 2; r <= row - 1; r++)
        {
            for (int c = ColA; c <= ColC; c++)
            {
                ws.Cell(r, c).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            }
        }

        

        return row;
    }


    private static void StyleMetaCell(IXLCell cell)
    {
        cell.Style.Font.FontName = "Swiss";
        cell.Style.Font.FontSize = 9;
        cell.Style.Font.Bold = true;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    // ════════════════════════════════════════════════════════════════════
    // HEADER INFO (rows 5–8) — BELOW the banner
    // ════════════════════════════════════════════════════════════════════
    private static int WriteHeaderInfo(IXLWorksheet ws, int row, RequisitionExportSource source)
    {
        // Row 5 — From | Value | Team | Value | To | Value
        ws.Row(row).Height = 22;

        StyleLabelCell(ws.Cell(row, ColA), "From");
        StyleValueCell(ws.Cell(row, ColB), "D&D");
        StyleLabelCell(ws.Cell(row, ColC), "Team");
        StyleValueCell(ws.Cell(row, ColD), string.Empty); // Team value if available
        ws.Cell(row, ColE).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        StyleLabelCell(ws.Cell(row, ColF), "To");
        var toVal = ws.Range(row, ColG, row, ColI).Merge();
        StyleValueCell(toVal, "Materials-D&D");

        ApplyRowBorder(ws, row, ColA, ColI);
        row++;

        // Row 6 — Product No. | [blank] | Rev. | Value | Project No. | [blank] | Value
        ws.Row(row).Height = 22;

        var prodNoLbl = ws.Range(row, ColA, row, ColB).Merge();
        StyleLabelCell(prodNoLbl, "Product No.");
        StyleValueCell(ws.Cell(row, ColC), source.ProductNo);
        StyleLabelCell(ws.Cell(row, ColD), "Rev.");
        StyleValueCell(ws.Cell(row, ColE), source.ProductRev);
        var projNoLbl = ws.Range(row, ColF, row, ColG).Merge();
        StyleLabelCell(projNoLbl, "Project No.");
        var projNoVal = ws.Range(row, ColH, row, ColI).Merge();
        StyleValueCell(projNoVal, source.ProjectNo);

        ApplyRowBorder(ws, row, ColA, ColI);
        row++;

        // Row 7 — Product Name (full width)
        ws.Row(row).Height = 22;

        var prodNameLbl = ws.Range(row, ColA, row, ColC).Merge();
        StyleLabelCell(prodNameLbl, "Product Name");
        var prodNameVal = ws.Range(row, ColD, row, ColI).Merge();
        StyleValueCell(prodNameVal, source.ProductName);
        prodNameVal.Style.Font.FontColor = InputBlue;

        ApplyRowBorder(ws, row, ColA, ColI);
        row++;

        // Row 8 — Purpose | Value | Monthly quantity | Value
        ws.Row(row).Height = 44;

        var purposeLbl = ws.Range(row, ColA, row, ColC).Merge();
        StyleLabelCell(purposeLbl, "Purpose");
        var purposeVal = ws.Range(row, ColD, row, ColE).Merge();
        StyleValueCell(purposeVal, source.Purpose);
        purposeVal.Style.Alignment.WrapText = true;

        var monthlyLbl = ws.Range(row, ColF, row, ColG).Merge();
        StyleLabelCell(monthlyLbl, "Monthly quantity as per new\nproduct requisition (Refer Note)");
        monthlyLbl.Style.Alignment.WrapText = true;
        monthlyLbl.Style.Font.FontSize = 8;

        var monthlyVal = ws.Range(row, ColH, row, ColI).Merge();
        StyleValueCell(monthlyVal, source.MonthlyQty.ToString());

        ApplyRowBorder(ws, row, ColA, ColI);
        row++;

        return row;
    }

    private static void StyleLabelCell(IXLCell cell, string text)
    {
        cell.Value = text;
        cell.Style.Font.FontName = "Swiss";
        cell.Style.Font.FontSize = 9;
        cell.Style.Font.Bold = true;
        cell.Style.Fill.BackgroundColor = LightBlue;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        cell.Style.Alignment.WrapText = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static void StyleLabelCell(IXLRange range, string text)
    {
        range.Value = text;
        range.Style.Font.FontName = "Swiss";
        range.Style.Font.FontSize = 9;
        range.Style.Font.Bold = true;
        range.Style.Fill.BackgroundColor = LightBlue;
        range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        range.Style.Alignment.WrapText = true;
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static void StyleValueCell(IXLCell cell, string text)
    {
        cell.Value = text;
        cell.Style.Font.FontName = "Swiss";
        cell.Style.Font.FontSize = 9;
        cell.Style.Font.FontColor = InputBlue;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        cell.Style.Alignment.WrapText = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static void StyleValueCell(IXLRange range, string text)
    {
        range.Value = text;
        range.Style.Font.FontName = "Swiss";
        range.Style.Font.FontSize = 9;
        range.Style.Font.FontColor = InputBlue;
        range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        range.Style.Alignment.WrapText = true;
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static void ApplyRowBorder(IXLWorksheet ws, int row, int fromCol, int toCol)
    {
        for (int c = fromCol; c <= toCol; c++)
        {
            var cellBorder = ws.Cell(row, c).Style.Border;

            // Check the individual sides instead of OutsideBorder
            if (cellBorder.TopBorder == XLBorderStyleValues.None &&
                cellBorder.BottomBorder == XLBorderStyleValues.None &&
                cellBorder.LeftBorder == XLBorderStyleValues.None &&
                cellBorder.RightBorder == XLBorderStyleValues.None)
            {
                // Setting OutsideBorder is allowed because it is write-only
                cellBorder.OutsideBorder = XLBorderStyleValues.Thin;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // COLUMN HEADERS (row 9) — DarkNavy
    // ════════════════════════════════════════════════════════════════════
    private static int WriteColumnHeaders(IXLWorksheet ws, int row)
    {
        ws.Row(row).Height = 40;

        void Hdr(int c1, int c2, string text)
        {
            var r = ws.Range(row, c1, row, c2).Merge();
            r.Value = text;
            r.Style.Fill.BackgroundColor = DarkNavy;
            r.Style.Font.FontName = "Swiss";
            r.Style.Font.FontSize = 9;
            r.Style.Font.Bold = true;
            r.Style.Font.FontColor = White;
            r.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            r.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            r.Style.Alignment.WrapText = true;
            r.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            r.Style.Border.OutsideBorderColor = Black;
            r.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
            r.Style.Border.InsideBorderColor = Black;
        }

        Hdr(ColA, ColA, "S.\nNo.");
        Hdr(ColB, ColB, "Part No.");
        Hdr(ColC, ColC, "Rev.");
        Hdr(ColD, ColE, "Part Name");
        Hdr(ColF, ColF, "Qty.");
        Hdr(ColG, ColG, "Required\nDate");
        Hdr(ColH, ColH, "Committed\ndate");
        Hdr(ColI, ColI, "Actual\ncompletion\ndate");

        return row + 1;
    }

    // ════════════════════════════════════════════════════════════════════
    // LINE ITEMS — Alternating PaleBlue/White
    // ════════════════════════════════════════════════════════════════════
    private static int WriteLineItems(IXLWorksheet ws, int startRow, List<RequisitionLineItem> items)
    {
        int row = startRow;
        bool shade = false;
        int rowCount = Math.Max(items?.Count ?? 0, 10);

        for (int i = 0; i < rowCount; i++)
        {
            var item = (items != null && i < items.Count) ? items[i] : null;
            ws.Row(row).Height = 44;
            var bg = shade ? PaleBlue : White;

            // A — S. No.
            var sno = ws.Cell(row, ColA);
            sno.Value = item?.SerialNo ?? (i + 1);
            StyleDataCell(sno, bg, XLAlignmentHorizontalValues.Center);

            // B — Part No.
            var partNo = ws.Cell(row, ColB);
            partNo.Value = item?.PartNo ?? string.Empty;
            StyleDataCell(partNo, bg, XLAlignmentHorizontalValues.Center);

            // C — Rev.
            var rev = ws.Cell(row, ColC);
            rev.Value = item?.Rev ?? string.Empty;
            StyleDataCell(rev, bg, XLAlignmentHorizontalValues.Center);

            // D–E — Part Name (merged)
            var partName = ws.Range(row, ColD, row, ColE).Merge();
            partName.Value = item?.PartName ?? string.Empty;
            StyleDataCell(partName, bg, XLAlignmentHorizontalValues.Center);
            partName.Style.Alignment.WrapText = true;

            // F — Qty.
            var qty = ws.Cell(row, ColF);
            qty.Value = item != null ? item.Qty : string.Empty;
            StyleDataCell(qty, bg, XLAlignmentHorizontalValues.Center);

            // G — Required Date
            var reqDate = ws.Cell(row, ColG);
            reqDate.Value = item != null ? item.RequiredDate.ToString(DateFmt) : string.Empty;
            StyleDataCell(reqDate, bg, XLAlignmentHorizontalValues.Center);

            // H — Committed date
            var commitDate = ws.Cell(row, ColH);
            commitDate.Value = item != null ? item.CommittedDate.ToString(DateFmt) : string.Empty;
            StyleDataCell(commitDate, bg, XLAlignmentHorizontalValues.Center);

            // I — Actual completion date
            var actDate = ws.Cell(row, ColI);
            actDate.Value = item?.ActualCompletionDate?.ToString(DateFmt) ?? string.Empty;
            StyleDataCell(actDate, bg, XLAlignmentHorizontalValues.Center);

            shade = !shade;
            row++;
        }

        return row;
    }

    private static void StyleDataCell(IXLCell cell, XLColor bg, XLAlignmentHorizontalValues hAlign)
    {
        cell.Style.Font.FontName = "Swiss";
        cell.Style.Font.FontSize = 9;
        cell.Style.Fill.BackgroundColor = bg;
        cell.Style.Alignment.Horizontal = hAlign;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static void StyleDataCell(IXLRange range, XLColor bg, XLAlignmentHorizontalValues hAlign)
    {
        range.Style.Font.FontName = "Swiss";
        range.Style.Font.FontSize = 9;
        range.Style.Fill.BackgroundColor = bg;
        range.Style.Alignment.Horizontal = hAlign;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    // ════════════════════════════════════════════════════════════════════
    // REMARKS BLOCK
    // ════════════════════════════════════════════════════════════════════
    private static int WriteRemarksBlock(IXLWorksheet ws, int row)
    {
        ws.Row(row).Height = 55;

        var cell = ws.Range(row, ColA, row, ColI).Merge();
        cell.Value = "Remarks / Notes\n\nIf MOQ is more than 1-month quantity, the concerned product leaders or engineers and sourcing persons shall be agreed together based on marketing demand and approval to be received from the concerned HODs before purchasing the components.";
        cell.Style.Font.FontName = "Swiss";
        cell.Style.Font.FontSize = 8;
        cell.Style.Font.Bold = true;
        cell.Style.Font.Italic = true;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
        cell.Style.Alignment.WrapText = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        cell.Style.Border.OutsideBorderColor = Black;

        return row + 1;
    }

    // ════════════════════════════════════════════════════════════════════
    // SIGNATURE BLOCK
    // ════════════════════════════════════════════════════════════════════
    private static int WriteSignatureBlock(IXLWorksheet ws, int row, RequisitionExportSource source)
    {
        ws.Row(row).Height = 44;

        // Prepared By
        var prep = ws.Range(row, ColA, row, ColC).Merge();
        prep.Value = $"Prepared\n{source.PreparedBy}";
        StyleSignatureBox(prep);

        // Checked By
        var check = ws.Range(row, ColD, row, ColE).Merge();
        check.Value = $"Checked\n{source.CheckedBy}";
        StyleSignatureBox(check);

        // Approved By
        var appr = ws.Range(row, ColF, row, ColH).Merge();
        var apprDate = source.ApprovedDate?.ToString("dd.MM.yyyy") ?? string.Empty;
        appr.Value = $"Approved\n{source.ApprovedBy}" +
                     (string.IsNullOrEmpty(apprDate) ? "" : $"\nDate: {apprDate}");
        StyleSignatureBox(appr);

        // Received By
        var recv = ws.Cell(row, ColI);
        recv.Value = $"Received\n{source.ReceivedBy}";
        StyleSignatureBox(recv.AsRange());

        return row + 1;
    }

    private static void StyleSignatureBox(IXLRange range)
    {
        range.Style.Font.FontName = "Swiss";
        range.Style.Font.FontSize = 9;
        range.Style.Font.Bold = true;
        range.Style.Fill.BackgroundColor = LightBlue;
        range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        range.Style.Alignment.WrapText = true;
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Medium;
        range.Style.Border.OutsideBorderColor = Black;
    }

    // ── Form metadata ─────────────────────────────────────────────────────
    private static void WriteFormMetadata(IXLWorksheet ws, int row)
    {
        ws.Row(row).Height = 16;

        string currentDate = DateTime.Now.ToString("dd.MM.yyyy");
        string leftText = $"Form No: F/D&D/21          Issue No: 4.2          Date: {currentDate}";

        var left = ws.Range(row, ColA, row, ColE).Merge();
        left.Value = leftText;
        left.Style.Font.FontName = "Swiss";
        left.Style.Font.FontSize = 7;
        left.Style.Font.Italic = true;
        left.Style.Font.FontColor = XLColor.FromHtml("#666666");
        left.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
        left.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        var right = ws.Range(row, ColF, row, ColI).Merge();
        right.Value = "Controlled Copy";
        right.Style.Font.FontName = "Swiss";
        right.Style.Font.FontSize = 7;
        right.Style.Font.Italic = true;
        right.Style.Font.FontColor = XLColor.FromHtml("#666666");
        right.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        left.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
    }

    // ════════════════════════════════════════════════════════════════════
    // PRINT / PAGE SETUP — A4
    // ════════════════════════════════════════════════════════════════════
    private static void ConfigurePrintSettings(IXLWorksheet ws, RequisitionExportSource source)
    {
        // A4 Paper
        ws.PageSetup.PaperSize = XLPaperSize.A4Paper;
        ws.PageSetup.PageOrientation = XLPageOrientation.Landscape;
        ws.PageSetup.PagesWide = 1;
        ws.PageSetup.PagesTall = 0;

        // Margins in inches
        ws.PageSetup.Margins.Left = 0.5;
        ws.PageSetup.Margins.Right = 0.4;
        ws.PageSetup.Margins.Top = 0.6;
        ws.PageSetup.Margins.Bottom = 0.6;
        ws.PageSetup.Margins.Header = 0.3;
        ws.PageSetup.Margins.Footer = 0.3;

        // Scale to fit page width
        ws.PageSetup.Scale = 85;

        // Header
        ws.PageSetup.Header.Left.AddText($"Product No: {source.ProductNo}",
            XLHFOccurrence.AllPages);
        ws.PageSetup.Header.Center.AddText("Requisition for Component Development",
            XLHFOccurrence.AllPages);
        ws.PageSetup.Header.Right.AddText($"Rec No: {source.RecNo}",
            XLHFOccurrence.AllPages);
        ws.PageSetup.Header.Right.AddNewLine();
        ws.PageSetup.Header.Right.AddText($"Date: {source.Date:dd-MMM-yyyy}",
            XLHFOccurrence.AllPages);

        // Footer
        ws.PageSetup.Footer.Left.AddText("Prepared By : ____________________",
            XLHFOccurrence.AllPages);
        string currentDate = DateTime.Now.ToString("dd.MM.yyyy");
        ws.PageSetup.Footer.Center.AddText(
            $"Form No: F/D&D/21  |  Issue No: 4.2  |  Date:  {currentDate}",
            XLHFOccurrence.AllPages);
        ws.PageSetup.Footer.Right.AddText("Approved By : ____________________",
            XLHFOccurrence.AllPages);

        // Repeat header rows on print
        ws.PageSetup.SetRowsToRepeatAtTop(1, 9);
    }
}