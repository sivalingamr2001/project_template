using System;
using System.Collections.Generic;

namespace Application.DTOs.Response;

public record RequisitionResponseDto(
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
    string Status,
    List<PartResponseDto> Parts,
    string PreparedBy,
    DateTime? PreparedDate,
    string CheckedBy,
    DateTime? CheckedDate,
    string ApprovedBy,
    DateTime? ApprovedDate,
    string ReceivedBy,
    DateTime? ReceivedDate,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
