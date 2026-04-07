using Server.Domain.Enums;

namespace Server.Features.Requests.Create;

public record CreateAccessRequest(
    int EmpId,
    int ReqTo,
    string ItsrNo,
    List<CreateAccessItemRequest> Items);

public record CreateAccessItemRequest(
    string FolderPath,
    int AccessType,
    string Reason);

public record AccessRequestResponse(int AccessReqId, string Status);

public record AccessRequestDetailResponse(
    int AccessReqId,
    int EmpId,
    int ReqTo,
    AggregateRequestStatus AggregateStatus,
    RequestStatus Status,
    string? ItsrNo,
    bool IsAgreed,
    int AccessItemId,
    string FolderPath,
    string Reason,
    AccessTypes AccessType
);
