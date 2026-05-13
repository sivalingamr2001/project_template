using System;
using System.Collections.Generic;

namespace Server.Features.Dashboard.AccessRequestDashboard;

public sealed record DashboardQuery(
    int? EmpId = null,
    int? ApproverId = null,
    string? Status = null,
    DateTime? From = null,
    DateTime? To = null
);

public sealed record DashboardResponse(
    DashboardSummaryDto Summary,
    IReadOnlyList<StatusBreakdownDto> StatusBreakdown,
    IReadOnlyList<AccessTypeBreakdownDto> AccessTypeBreakdown,
    IReadOnlyList<RecentRequestDto> RecentRequests,
    IReadOnlyList<PendingApprovalDto> PendingApprovals,
    IReadOnlyList<AuditLogDto> RecentAuditLogs,
    IReadOnlyList<TrendPointDto> Trend,
    DateTime GeneratedAt
);

public sealed record DashboardSummaryDto(
    int TotalRequests,
    int PendingCount,
    int ApprovedCount,
    int RejectedCount,
    int AgreedCount,
    int TotalItems,
    int UnreadNotifications
);

public sealed record StatusBreakdownDto(string Status, int Count, double Percentage);
public sealed record AccessTypeBreakdownDto(string AccessType, int Count, double Percentage);

public sealed record RecentRequestDto(
    int AccessReqId,
    int EmpId,
    int ReqTo,
    bool IsAgreed,
    string? ItsrNo,
    DateTime CreatedOn,
    string CreatedBy,
    int ItemCount,
    string OverallStatus
);

public sealed record PendingApprovalDto(
    int AccessApproveId,
    int AccessReqId,
    int AccessItemId,
    int ApproverId,
    string ApprovalStatus,
    string TicketNumber,
    string FolderPath,
    string AccessType,
    string RequestedBy,
    DateTime CreatedOn
);

public sealed record AuditLogDto(
    int AuditId,
    int AccessReqId,
    int? AccessItemId,
    string EventType,
    string Message,
    string RecipientName,
    string RecipientRole,
    bool IsRead,
    DateTime CreatedOn
);

public sealed record TrendPointDto(
    string Date,
    int Submitted,
    int Approved,
    int Rejected
);
