using Server.Domain.Enums;

namespace Server.Features.AccessRequests.ReviewByHod;

public sealed record ReviewByHodRequest(
    int ReviewerEmployeeId,
    AccessTypes ConfirmAccessType,
    bool Approved,
    string? Comments);

public sealed record ReviewAccessRequestResponse(
    int AccessReqId,
    RequestStatus Status,
    AggregateRequestStatus AggregateStatus,
    string Message);
