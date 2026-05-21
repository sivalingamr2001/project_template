using Server.Domain.Enums;

namespace Server.Features.AccessRequests.ReviewByHod;

public sealed record ReviewByHodRequest(
    int ReviewerUserId,
    AccessTypes ConfirmAccessType,
    bool Approved,
    string? Comments);

public sealed record ReviewAccessRequestResponse(
    int AccessReqId,
    RequestStatus Status,
    string Message);
