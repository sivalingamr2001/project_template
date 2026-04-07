namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class AuditLogEntity
{
    public int AuditId { get; set; }
    public int RequestId { get; set; }
    public int? AccessItemId { get; set; }
    public string Stage { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? ActorEmployeeId { get; set; }
    public string? ActorName { get; set; }
    public string? Comments { get; set; }
    public DateTimeOffset HappenedAtUtc { get; set; }
}
