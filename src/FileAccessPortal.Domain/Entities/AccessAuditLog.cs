using FileAccessPortal.Domain.Enums;

namespace FileAccessPortal.Domain.Entities;

public sealed record AccessAuditLog(
    int Id,
    int RequestId,
    int? AccessItemId,
    DateTimeOffset HappenedAtUtc,
    AccessReviewStage Stage,
    string EventType,
    string Message,
    int? ActorEmployeeId,
    string? ActorName,
    string? Comments);
