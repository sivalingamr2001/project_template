using System;
using System.Collections.Generic;

namespace Application.DTOs.Response
{
    public sealed record RequisitionExportWorkbook(
        byte[] Content,
        string ContentType,
        string FileName);

    public sealed record RequisitionLineItem(
        int SerialNo,
        string PartNo,
        string Rev,
        string PartName,
        int Qty,
        DateTime RequiredDate,
        DateTime CommittedDate,
        DateTime? ActualCompletionDate);

    public sealed record RequisitionExportSource(
        string RecNo,
        DateTime Date,
        string PageNo,
        string FromTeam,
        string ToTeam,
        string ProductNo,
        string ProductRev,
        string ProjectNo,
        string ProductName,
        string Purpose,
        int MonthlyQty,
        List<RequisitionLineItem> LineItems,
        string PreparedBy,
        DateTime? PreparedDate,
        string CheckedBy,
        DateTime? CheckedDate,
        string ApprovedBy,
        DateTime? ApprovedDate,
        string ReceivedBy,
        DateTime? ReceivedDate);
}
