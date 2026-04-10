using Server.Domain.Enums;

namespace Server.Features.AccessRequests.Resubmit;

public sealed record ResubmitAccessItemRequest(
    int ReviewerEmployeeId,
    string Comments);

public sealed record ResubmitAccessItemResponse(
    int AccessReqId,
    int AccessItemId,
    RequestStatus Status,
    string Message);
