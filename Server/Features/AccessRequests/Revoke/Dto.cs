namespace Server.Features.AccessRequests.Revoke;

public sealed record RevokeAccessRequest(
    int ReviewerEmployeeId,
    string Comments);
