using FileAccessPortal.Domain.Enums;

namespace FileAccessPortal.Domain.Entities;

public sealed class AccessRequestItem
{
    public int AccessItemId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string FolderPath { get; init; } = string.Empty;
    public string AccessType { get; set; } = string.Empty;
    public string BusinessReason { get; set; } = string.Empty;
    public FileAccessRequestStatus Status { get; set; }
    public int ResubmissionCount { get; set; }
    public DateTimeOffset? ApprovedUntilUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; set; }
    public string? RejectionReason { get; set; }
    public AccessReviewStage? RejectedByStage { get; set; }
    public int? HodReviewerEmployeeId { get; set; }
    public string? HodReviewerName { get; set; }
    public DateTimeOffset? HodReviewedAtUtc { get; set; }
    public string? HodNote { get; set; }
    public int? ItReviewerEmployeeId { get; set; }
    public string? ItReviewerName { get; set; }
    public DateTimeOffset? ItReviewedAtUtc { get; set; }
    public string? ItNote { get; set; }

    public static AccessRequestItem Create(
        int accessItemId,
        string fileName,
        string folderPath,
        string accessType,
        string businessReason)
    {
        return new AccessRequestItem
        {
            AccessItemId = accessItemId,
            FileName = fileName,
            FolderPath = folderPath,
            AccessType = accessType,
            BusinessReason = businessReason,
            Status = FileAccessRequestStatus.PendingHodApproval
        };
    }

    public void ReviewByHod(AppUser reviewer, bool approved, string? note, DateTimeOffset reviewedAtUtc)
    {
        if (Status != FileAccessRequestStatus.PendingHodApproval)
        {
            throw new InvalidOperationException("Only items pending HOD approval can be reviewed by HOD.");
        }

        HodReviewerEmployeeId = reviewer.EmployeeId;
        HodReviewerName = reviewer.Name;
        HodReviewedAtUtc = reviewedAtUtc;
        HodNote = Normalize(note);
        RejectionReason = approved ? null : Normalize(note);
        RejectedByStage = approved ? null : AccessReviewStage.Hod;
        Status = approved ? FileAccessRequestStatus.PendingItGrant : FileAccessRequestStatus.PendingUserResubmission;
    }

    public void ReviewByIt(AppUser reviewer, bool approved, string? note, DateTimeOffset reviewedAtUtc)
    {
        if (Status != FileAccessRequestStatus.PendingItGrant)
        {
            throw new InvalidOperationException("Only items approved by HOD can be reviewed by IT.");
        }

        ItReviewerEmployeeId = reviewer.EmployeeId;
        ItReviewerName = reviewer.Name;
        ItReviewedAtUtc = reviewedAtUtc;
        ItNote = Normalize(note);
        RejectionReason = approved ? null : Normalize(note);
        RejectedByStage = approved ? null : AccessReviewStage.ItTeam;
        Status = approved ? FileAccessRequestStatus.Granted : FileAccessRequestStatus.PendingUserResubmission;
        ApprovedUntilUtc = approved ? reviewedAtUtc.AddDays(365) : null;
        RevokedAtUtc = null;
    }

    public void Resubmit(string accessType, string businessReason)
    {
        if (Status != FileAccessRequestStatus.PendingUserResubmission && Status != FileAccessRequestStatus.Expired)
        {
            throw new InvalidOperationException("Only rejected or expired items can be resubmitted.");
        }

        AccessType = accessType.Trim();
        BusinessReason = businessReason.Trim();
        Status = FileAccessRequestStatus.PendingHodApproval;
        ResubmissionCount++;
        ApprovedUntilUtc = null;
        RevokedAtUtc = null;
        RejectionReason = null;
        RejectedByStage = null;
    }

    public void Revoke(DateTimeOffset revokedAtUtc)
    {
        if (Status != FileAccessRequestStatus.Granted)
        {
            throw new InvalidOperationException("Only granted items can be revoked.");
        }

        Status = FileAccessRequestStatus.Revoked;
        RevokedAtUtc = revokedAtUtc;
    }

    public void Expire(DateTimeOffset now)
    {
        if (Status == FileAccessRequestStatus.Granted &&
            ApprovedUntilUtc is not null &&
            ApprovedUntilUtc <= now)
        {
            Status = FileAccessRequestStatus.Expired;
        }
    }

    public AccessRequestItem CreateRenewal(int accessItemId)
    {
        if (Status != FileAccessRequestStatus.Granted && Status != FileAccessRequestStatus.Expired)
        {
            throw new InvalidOperationException("Only granted or expired items can be renewed.");
        }

        return Create(accessItemId, FileName, FolderPath, AccessType, BusinessReason);
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
