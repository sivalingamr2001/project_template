namespace Server.Features.AccessRequests.Revoke;

public sealed record RevokeAccessRequest(
    int ReviewerUserId,
    string Comments);
