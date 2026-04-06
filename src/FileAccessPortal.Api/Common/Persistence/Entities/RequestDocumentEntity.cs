namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class RequestDocumentEntity
{
    public int RequestId { get; set; }
    public int? ParentRequestId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public int RequestedByEmployeeId { get; set; }
    public int DepartmentId { get; set; }
    public DateTimeOffset RequestedAtUtc { get; set; }
    public string AggregateStatus { get; set; } = string.Empty;
    public string JsonContent { get; set; } = string.Empty;
    public string? CamundaBusinessKey { get; set; }
    public string? CamundaProcessInstanceId { get; set; }
    public string? CamundaLastAction { get; set; }
}
