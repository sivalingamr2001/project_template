using Server.Domain.Enums;

namespace Server.Features.AccessRequests.Create;

public sealed record CreateAccessRequest(
    int? AccessReqId,
    int EmpId,
    bool IsAgree,
    int ReqTo,
    string? ItsrNo,
    List<CreateAccessItemRequest> Items);

public sealed record CreateAccessItemRequest(
    string FolderPath,
    int AccessType,
    int ConfirmAccessTypeByHOD,
    string Reason);

public sealed record CreateAccessRequestResponse(
    int AccessReqId,
    int EmpId,
    int ReqTo,
    bool IsAgree,
    string? ItsrNo,
    RequestStatus Status,
    AggregateRequestStatus AggregateStatus,
    IReadOnlyList<CreateAccessItemResponse> Items);

public sealed record CreateAccessItemResponse(
    int AccessItemId,
    string FolderPath,
    AccessTypes AccessType,
    AccessTypes ConfirmAccessTypeByHOD,
    string Reason);
