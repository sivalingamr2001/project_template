namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class AccessItemEntity
{
    public int AccessItemId { get; set; }
    public int RequestId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FolderPath { get; set; } = string.Empty;
    public string AccessType { get; set; } = string.Empty;
    public string BusinessReason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ResubmissionCount { get; set; }
    public DateTimeOffset? ApprovedUntilUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; set; }
    public int? RevokedBy { get; set; }
    public string? RevokeReason { get; set; }
    public string? RejectionReason { get; set; }
    public string? RejectedByStage { get; set; }
    public int? HodReviewerEmployeeId { get; set; }
    public string? HodReviewerName { get; set; }
    public DateTimeOffset? HodReviewedAtUtc { get; set; }
    public string? HodNote { get; set; }
    public int? ItReviewerEmployeeId { get; set; }
    public string? ItReviewerName { get; set; }
    public DateTimeOffset? ItReviewedAtUtc { get; set; }
    public string? ItNote { get; set; }
    public int? ParentAccessItemId { get; set; }
    public int VersionNo { get; set; } = 1;
    public bool IsLatest { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedOn { get; set; }
    public int CreatedBy { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }
    public int? UpdatedBy { get; set; }
}
