using Server.Domain.Enums;

namespace Server.Features.AccessRequests.GetDetails;

public sealed record AccessRequestDetailsDto(
    int AccessReqId,
    int EmpId,
    string RequesterName,
    int DeptId,
    string DepartmentName,
    int ReqTo,
    string CurrentApproverName,
    string CurrentApproverRole,
    string? ItsrNo,
    DateTime CreatedOn,
    DateTime? ModifiedOn,
    IReadOnlyList<AccessRequestItemDto> Items,
    IReadOnlyList<AccessRequestApprovalDto> Approvals,
    IReadOnlyList<AccessRequestTimelineDto> Timeline);

public sealed record AccessRequestItemDto(
    int AccessItemId,
    RequestStatus Status,
    string FolderPath,
    AccessTypes AccessType,
    string Reason,
    DateTime CreatedOn);

public sealed record AccessRequestApprovalDto(
    int AccessApproveId,
    int ApproverId,
    string ApproverName,
    string ApproverRole,
    RequestStatus ApprovalStatus,
    string Comments,
    DateTime CreatedOn);

public sealed record AccessRequestTimelineDto(
    int AuditId,
    string EventType,
    string Message,
    int RecipientEmpId,
    string RecipientName,
    string RecipientRole,
    bool IsRead,
    DateTime CreatedOn);

public class AccessExpirationResponse
{
    public DateTime ApprovedOn { get; set; }
    public DateTime ExpiresOn { get; set; }
}
