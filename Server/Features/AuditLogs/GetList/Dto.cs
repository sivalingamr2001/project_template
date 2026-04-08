namespace Server.Features.AuditLogs.GetList;

public sealed record AuditLogDto(
    int AuditId,
    string Actor,
    string EventType,
    int RequestId,
    DateTime CreatedOn,
    string Details);
