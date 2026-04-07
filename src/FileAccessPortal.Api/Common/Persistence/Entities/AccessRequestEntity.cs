namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class AccessRequestEntity
{
    public int RequestId { get; set; }
    public int? ParentRequestId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public int RequestedByEmployeeId { get; set; }
    public string RequestedByName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public DateTimeOffset RequestedAtUtc { get; set; }
    public string AggregateStatus { get; set; } = string.Empty;
    public int ResubmissionCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedOn { get; set; }
    public int CreatedBy { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }
    public int? UpdatedBy { get; set; }
    public string? CamundaBusinessKey { get; set; }
    public string? CamundaProcessInstanceId { get; set; }
    public string? CamundaLastAction { get; set; }
}
