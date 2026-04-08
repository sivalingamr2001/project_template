using Server.Domain.Enums;

namespace Server.Features.AccessRequests.Renew;

public sealed record RenewAccessRequest(
    int RequestedByEmployeeId,
    string? ItsrNo);

public sealed record RenewAccessRequestResponse(
    int AccessReqId,
    RequestStatus Status,
    AggregateRequestStatus AggregateStatus,
    string Message);
