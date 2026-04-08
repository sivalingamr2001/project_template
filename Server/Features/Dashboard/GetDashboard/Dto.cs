using Server.Domain.Enums;
using Server.Shared.Helpers;

namespace Server.Features.Dashboard.GetDashboard;

public sealed class GetDashboardQuery : PagedRequest;

public sealed record DashboardAccessRequestDto(
    int AccessReqId,
    int EmpId,
    int ReqTo,
    AggregateRequestStatus AggregateStatus,
    RequestStatus Status,
    string? ItsrNo,
    bool IsAgreed,
    List<AccessItemDto> AccessItems,
    List<ApprovalItemDto> ApprovalItems);

public record AccessItemDto(
    int AccessItemId,
    string FolderPath,
    string Reason,
    AccessTypes AccessType);

public record ApprovalItemDto(
    int ApprovalId,
    int ApproverId,
    RequestStatus Status,
    string Remarks);
