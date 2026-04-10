using Server.Domain.Enums;

namespace Server.Features.AccessRequests.Renew;

public sealed record RenewAccessRequest(
    int RequestedByEmployeeId,
    string? ItsrNo);

public sealed record RenewAccessRequestResponse(
    int AccessItemId,
    RequestStatus Status,
    string Message);
