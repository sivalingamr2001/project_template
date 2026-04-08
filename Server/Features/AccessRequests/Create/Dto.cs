namespace Server.Features.AccessRequests.Create;

public sealed record CreateAccessRequest(
    int EmpId,
    int ReqTo,
    string? ItsrNo,
    
    List<CreateAccessItemRequest> Items);

public sealed record CreateAccessItemRequest(
    string FolderPath,
    int AccessType,
    string Reason);

public sealed record CreateAccessRequestResponse(int AccessReqId, string Status);
