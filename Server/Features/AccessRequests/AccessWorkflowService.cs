using Server.Domain.Entities;
using Server.Infrastructure.Persistence;

namespace Server.Features.AccessRequests;

public class AccessWorkflowService
{
    public const string Pending = "Pending";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Revoked = "Revoked";

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
        if (detail.Approvals.Any(a => a.Status == Rejected))
        {
            detail.Status = Rejected;
        }
        else if (detail.Approvals.All(a => a.Status == Approved))
        {
            detail.Status = Approved;
        }
        else if (detail.Approvals.Any(a => a.Status == Revoked))
        {
            detail.Status = Revoked;
        }
        else
        {
            detail.Status = Pending;
        }

        detail.ModifiedOn = DateTime.UtcNow;
        detail.ModifiedBy = modifiedBy;
    }

    public void UpdateRequestStatus(AccessRequest request, string modifiedBy)
    {
        if (!request.Details.Any())
        {
            request.Status = Pending;
        }
        else if (request.Details.Any(d => d.Status == Rejected))
        {
            request.Status = Rejected;
        }
        else if (request.Details.Any(d => d.Status == Revoked) || request.IsRevoke)
        {
            request.Status = Revoked;
        }
        else if (request.Details.All(d => d.Status == Approved))
        {
            request.Status = Approved;
        }
        else
        {
            request.Status = Pending;
        }

        request.ModifiedOn = DateTime.UtcNow;
        request.ModifiedBy = modifiedBy;
    }
}
