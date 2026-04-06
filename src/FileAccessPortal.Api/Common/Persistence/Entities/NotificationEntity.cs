namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class NotificationEntity
{
    public int Id { get; set; }
    public int RequestId { get; set; }
    public int? AccessItemId { get; set; }
    public int RecipientEmployeeId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientStage { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public bool IsRead { get; set; }
}
