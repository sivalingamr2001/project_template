namespace Server.Features.AccessRequests.ReviewByIt;

public sealed record ReviewByItRequest(
    int ReviewerUserId,
    bool Approved,
    string? Comments,
    string? ItsrNo);
