namespace FileAccessPortal.Domain.Enums;

public enum FileAccessRequestStatus
{
    PendingHodApproval = 1,
    PendingUserResubmission = 2,
    PendingItGrant = 3,
    Granted = 4,
    Revoked = 5,
    Expired = 6
}
