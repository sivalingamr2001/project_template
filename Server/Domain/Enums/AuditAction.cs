namespace Server.Domain.Enums;

public enum AuditAction
{
    RequestCreated,
    HODApproved,
    HODRejected,
    ITApproved,
    ITRejected,
    AccessGranted,
    Revoked,
    Expired
}
