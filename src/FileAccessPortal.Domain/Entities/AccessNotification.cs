using FileAccessPortal.Domain.Enums;

namespace FileAccessPortal.Domain.Entities;

public sealed record AccessNotification(
    int Id,
    int RequestId,
    int? AccessItemId,
    int RecipientEmployeeId,
    string RecipientName,
    AccessReviewStage RecipientStage,
    string EventType,
    string Message,
    DateTimeOffset CreatedAtUtc,
    bool IsRead = false);
