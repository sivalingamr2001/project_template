using Server.Domain.Enums;

namespace Server.Features.AccessRequests.ReviewByHod;

public sealed record ReviewByHodRequest(
    int ReviewerEmployeeId,
    IReadOnlyList<ReviewByHodItemRequest> Items);

public sealed record ReviewByHodItemRequest(
    int AccessItemId,
    AccessTypes ConfirmAccessType,
    bool Approved,
    bool IsValidated,
    string? Comments);

public sealed record ReviewAccessRequestResponse(
    int AccessReqId,
    RequestStatus Status,
    AggregateRequestStatus AggregateStatus,
    string Message);
