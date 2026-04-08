namespace Server.Features.AccessRequests.ReviewByIt;

public sealed record ReviewByItRequest(
    int ReviewerEmployeeId,
    bool Approved,
    string? Comments,
    string? ItsrNo);
