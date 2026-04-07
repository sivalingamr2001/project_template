namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class ApprovalEntity
{
    public int ApprovalId { get; set; }
    public int AccessItemId { get; set; }
    public string Stage { get; set; } = string.Empty;
    public int StageOrder { get; set; }
    public int ReviewerId { get; set; }
    public string Decision { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
    public int CreatedBy { get; set; }
}
