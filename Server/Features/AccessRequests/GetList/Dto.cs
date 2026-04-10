using Server.Domain.Enums;
using Server.Shared.Helpers;

namespace Server.Features.AccessRequests.GetList;

public sealed class GetAccessRequestsQuery : PagedRequest;

public sealed record AccessRequestListItemDto(
    int AccessReqId,
    int EmpId,
    int ReqTo,
    RequestStatus Status,
    string? ItsrNo,
    bool IsAgreed,
    int AccessItemId,
    string FolderPath,
    string Reason,
    AccessTypes AccessType);
