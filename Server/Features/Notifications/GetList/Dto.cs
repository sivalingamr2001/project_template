namespace Server.Features.Notifications.GetList;

public sealed record NotificationDto(
    int AuditId,
    int AccessReqId,
    string EventType,
    string Message,
    int RecipientEmpId,
    string RecipientName,
    string RecipientRole,
    bool IsRead,
    DateTime CreatedOn);
