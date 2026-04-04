namespace Server.Application.DTOs;

public record AccessDetailCreateDto(string FolderPath, string AccessType, string? Reason, DateTime? ExpiredAt);

public record AccessRequestCreateDto(int EmpId, string ITSRNumber, bool IsAgreed, bool IsRevoke, List<AccessDetailCreateDto> Details);

public record AccessApprovalActionDto(int ApproverEmpId, int ApprovalLevel, string Status, string? Comments);

public record AccessApprovalResponseDto(
    int Id,
    int AccessDetailId,
    int ApproverEmpId,
    int ApprovalLevel,
    string Status,
    string? Comments,
    DateTime CreatedOn,
    string CreatedBy,
    DateTime ModifiedOn,
    string ModifiedBy);

public record AccessDetailResponseDto(
    int Id,
    int AccessRequestId,
    string FolderPath,
    string AccessType,
    string? Reason,
    string Status,
    DateTime? ExpiredAt,
    bool IsActive,
    DateTime CreatedOn,
    string CreatedBy,
    DateTime ModifiedOn,
    string ModifiedBy,
    List<AccessApprovalResponseDto> Approvals);

public record AccessRequestResponseDto(
    int Id,
    int EmpId,
    string Status,
    bool IsAgreed,
    bool IsRevoke,
    bool IsActive,
    string? ITSRNumber,
    DateTime CreatedOn,
    string CreatedBy,
    DateTime ModifiedOn,
    string ModifiedBy,
    List<AccessDetailResponseDto> Details);

public record PendingApprovalQueueItemDto(
    int RequestId,
    int DetailId,
    int ApprovalId,
    int RequestEmpId,
    int ApproverEmpId,
    int ApprovalLevel,
    string RequestStatus,
    string DetailStatus,
    string ApprovalStatus,
    string FolderPath,
    string AccessType,
    string? Reason,
    DateTime? ExpiredAt,
    string? ITSRNumber,
    DateTime RequestCreatedOn,
    string? Comments);

public record ActiveAccessDto(
    int RequestId,
    int DetailId,
    int EmpId,
    string FolderPath,
    string AccessType,
    string Status,
    DateTime? GrantedUntil,
    bool IsExpired,
    string? ITSRNumber,
    DateTime RequestCreatedOn);

public record AccessNotificationResponseDto(
    int Id,
    int? AccessRequestId,
    int? AccessDetailId,
    int? AccessApprovalId,
    int? RecipientEmpId,
    string RecipientType,
    string EventType,
    string Message,
    bool IsRead,
    DateTime CreatedOn,
    string CreatedBy);

public record AccessAuditLogResponseDto(
    int Id,
    int? AccessRequestId,
    int? AccessDetailId,
    int? AccessApprovalId,
    int? ActorEmpId,
    string EventType,
    string Status,
    string Message,
    string? Comments,
    DateTime CreatedOn,
    string CreatedBy);
