using Server.Shared.Helpers;

namespace Server.Features.Notifications.GetList;

public sealed class GetNotificationsQuery : PagedRequest;

public sealed record NotificationDto(
    int AuditId,
    int AccessReqId,
    string EventType,
    string Message,
    int RecipientUserId,
    string RecipientName,
    string RecipientRole,
    bool IsRead,
    DateTime CreatedOn);
