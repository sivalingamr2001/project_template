namespace FileAccessPortal.Domain.Entities;

public class AccessRequest
{
    public int RequestId { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public int RequesterId { get; set; }
    public int DepartmentId { get; set; }
    public AccessRequestStatus AggregateStatus { get; set; } = AccessRequestStatus.Pending;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public int? ModifiedBy { get; set; }

    public ICollection<AccessItem> AccessItems { get; set; } = [];
    public ICollection<RequestAuditTrail> AuditTrailEntries { get; set; } = [];
}

public class AccessItem
{
    public int AccessItemId { get; set; }
    public int RequestId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FolderPath { get; set; } = string.Empty;
    public AccessType AccessType { get; set; }
    public AccessItemStatus Status { get; set; } = AccessItemStatus.PendingHodReview;
    public DateTime? ApprovedUntilUtc { get; set; }
    public int? ParentAccessItemId { get; set; }
    public int ResubmissionCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public int? ModifiedBy { get; set; }

    public AccessRequest Request { get; set; } = default!;
    public AccessItem? ParentAccessItem { get; set; }
    public ICollection<AccessItem> Resubmissions { get; set; } = [];
    public ICollection<AccessItemReview> Reviews { get; set; } = [];
}

public class AccessItemReview
{
    public int ReviewId { get; set; }
    public int AccessItemId { get; set; }
    public ReviewStage Stage { get; set; }
    public int ReviewerId { get; set; }
    public string? Note { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public int? ModifiedBy { get; set; }

    public AccessItem AccessItem { get; set; } = default!;
}

public class RequestAuditTrail
{
    public int AuditId { get; set; }
    public int RequestId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public int? ModifiedBy { get; set; }

    public AccessRequest Request { get; set; } = default!;
}

public enum AccessType
{
    Read = 1,
    Write = 2,
    ReadWrite = 3
}

public enum AccessRequestStatus
{
    Pending = 1,
    Granted = 2,
    Rejected = 3
}

public enum AccessItemStatus
{
    PendingHodReview = 1,
    PendingItReview = 2,
    Granted = 3,
    Rejected = 4,
    Expired = 5
}

public enum ReviewStage
{
    Hod = 1,
    ItTeam = 2
}

public enum ReviewDecision
{
    Approved = 1,
    Rejected = 2
}

public static class AuditEventTypes
{
    public const string RequestSubmitted = "request.submitted";
    public const string HodApproved = "hod.approved";
    public const string HodRejected = "hod.rejected";
    public const string ItApproved = "it.approved";
    public const string ItRejected = "it.rejected";
    public const string RequestResubmitted = "request.resubmitted";
    public const string AccessExpired = "access.expired";
}
