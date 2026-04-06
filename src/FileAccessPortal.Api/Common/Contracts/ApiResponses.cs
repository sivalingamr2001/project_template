using FileAccessPortal.Domain.Entities;

namespace FileAccessPortal.Api.Common.Contracts;

public sealed record SessionResponse(UserResponse User);

public sealed record UserResponse(
    int EmployeeId,
    string EmployeeCode,
    string Name,
    string Email,
    int DepartmentId,
    string DepartmentName,
    string Role);

public sealed record NotificationResponse(
    int Id,
    int RequestId,
    int? AccessItemId,
    string EventType,
    string Message,
    string RecipientStage,
    DateTimeOffset CreatedAtUtc,
    bool IsRead);

public sealed record AuditResponse(
    int Id,
    int RequestId,
    int? AccessItemId,
    string Stage,
    string EventType,
    string Message,
    int? ActorEmployeeId,
    string? ActorName,
    string? Comments,
    DateTimeOffset HappenedAtUtc);

public sealed record AccessItemResponse(
    int AccessItemId,
    string FileName,
    string FolderPath,
    string AccessType,
    string BusinessReason,
    string Status,
    int ResubmissionCount,
    DateTimeOffset? ApprovedUntilUtc,
    DateTimeOffset? RevokedAtUtc,
    string? RejectionReason,
    string? RejectedByStage,
    int? HodReviewerEmployeeId,
    string? HodReviewerName,
    DateTimeOffset? HodReviewedAtUtc,
    string? HodNote,
    int? ItReviewerEmployeeId,
    string? ItReviewerName,
    DateTimeOffset? ItReviewedAtUtc,
    string? ItNote);

public sealed record RequestResponse(
    int RequestId,
    int? ParentRequestId,
    string TicketNumber,
    int RequestedByEmployeeId,
    string RequestedByName,
    int DepartmentId,
    string DepartmentName,
    string AggregateStatus,
    DateTimeOffset RequestedAtUtc,
    string? CamundaBusinessKey,
    string? CamundaProcessInstanceId,
    string? CamundaLastAction,
    IReadOnlyList<AccessItemResponse> Items,
    IReadOnlyList<AuditResponse> AuditTrail);

public sealed record DashboardCountsResponse(
    int Total,
    int PendingHod,
    int PendingUserResubmission,
    int PendingIt,
    int Granted,
    int Revoked,
    int Expired);

public sealed record DashboardApprovalsResponse(int HodInbox, int ItInbox);

public sealed record DashboardResponse(
    UserResponse CurrentUser,
    DashboardCountsResponse Counts,
    DashboardApprovalsResponse Approvals,
    IReadOnlyList<RequestResponse> Requests,
    IReadOnlyList<NotificationResponse> Notifications);
