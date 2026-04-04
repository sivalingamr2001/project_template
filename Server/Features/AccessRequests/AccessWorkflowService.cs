using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.AccessRequests;

public class AccessWorkflowService
{
    private readonly AppDbContext _db;

    public AccessWorkflowService(AppDbContext db) => _db = db;

    public Task AddNotificationAsync(
        int? requestId,
        int? detailId,
        int? approvalId,
        int? recipientEmpId,
        string recipientType,
        string eventType,
        string message,
        string createdBy)
    {
        _db.AccessNotifications.Add(new AccessNotification
        {
            AccessRequestId = requestId,
            AccessDetailId = detailId,
            AccessApprovalId = approvalId,
            RecipientEmpId = recipientEmpId,
            RecipientType = recipientType,
            EventType = eventType,
            Message = message,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = createdBy
        });

        return Task.CompletedTask;
    }

    public Task AddAuditAsync(
        int? requestId,
        int? detailId,
        int? approvalId,
        int? actorEmpId,
        string eventType,
        string status,
        string message,
        string? comments,
        string createdBy)
    {
        _db.AccessAuditLogs.Add(new AccessAuditLog
        {
            AccessRequestId = requestId,
            AccessDetailId = detailId,
            AccessApprovalId = approvalId,
            ActorEmpId = actorEmpId,
            EventType = eventType,
            Status = status,
            Message = message,
            Comments = comments,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = createdBy
        });

        return Task.CompletedTask;
    }

    public void UpdateDetailStatus(AccessDetail detail, string modifiedBy)
    {
        if (detail.Approvals.Any(a => a.Status == AccessStatus.Rejected))
        {
            detail.Status = AccessStatus.Rejected;
        }
        else if (detail.Approvals.Any(a => a.Status == AccessStatus.Revoked))
        {
            detail.Status = AccessStatus.Revoked;
        }
        else if (detail.Approvals.All(a => a.Status == AccessStatus.Approved))
        {
            detail.Status = AccessStatus.Approved;
        }
        else if (detail.Approvals.Any(a => a.ApprovalLevel == ApprovalType.HOD && a.Status == AccessStatus.Approved))
        {
            // HOD approved, IT still pending
            detail.Status = AccessStatus.PendingIT;
        }
        else
        {
            // HOD not yet approved
            detail.Status = AccessStatus.PendingHOD;
        }

        detail.ModifiedOn = DateTime.UtcNow;
        detail.ModifiedBy = modifiedBy;
    }

    public void UpdateRequestStatus(AccessRequest request, string modifiedBy)
    {
        if (!request.Details.Any())
        {
            request.Status = "Pending";
        }
        else if (request.Details.Any(d => d.Status == AccessStatus.Rejected))
        {
            request.Status = "Rejected";
        }
        else if (request.Details.Any(d => d.Status == AccessStatus.Revoked) || request.IsRevoke)
        {
            request.Status = "Revoked";
        }
        else if (request.Details.All(d => d.Status == AccessStatus.Approved))
        {
            request.Status = "Approved";
        }
        else
        {
            request.Status = "Pending";
        }

        request.ModifiedOn = DateTime.UtcNow;
        request.ModifiedBy = modifiedBy;
    }
}
