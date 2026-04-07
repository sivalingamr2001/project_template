using FileAccessPortal.Domain.Entities;
using FileAccessPortal.Api.Common.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FileAccessPortal.Api.Common.Workflow;

/// <summary>
/// Workflow aligned to the current table design:
/// AccessRequests -> AccessItems -> AccessItemReviews -> RequestAuditTrail.
/// Review outcomes are reflected on AccessItems.Status and logged in RequestAuditTrail.
/// </summary>
public class AccessWorkflowService(AccessManagementDbContext db, TimeProvider clock)
{
    private readonly TimeProvider _clock = clock;

    public async Task RecordHodDecisionAsync(
        int accessItemId,
        int reviewerId,
        ReviewDecision decision,
        string? note,
        CancellationToken ct = default)
    {
        var item = await db.AccessItems
            .Include(accessItem => accessItem.Request)
            .FirstOrDefaultAsync(accessItem => accessItem.AccessItemId == accessItemId && accessItem.IsActive, ct)
            ?? throw new InvalidOperationException("Access item not found.");

        if (item.Status != AccessItemStatus.PendingHodReview)
        {
            throw new InvalidOperationException("Item is not pending HOD review.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;

        item.Status = decision == ReviewDecision.Approved
            ? AccessItemStatus.PendingItReview
            : AccessItemStatus.Rejected;
        item.UpdatedOn = now;
        item.ModifiedBy = reviewerId;

        db.AccessItemReviews.Add(new AccessItemReview
        {
            AccessItemId = item.AccessItemId,
            Stage = ReviewStage.Hod,
            ReviewerId = reviewerId,
            Note = note,
            CreatedOn = now,
            CreatedBy = reviewerId
        });

        await AppendAuditAsync(
            item.RequestId,
            decision == ReviewDecision.Approved ? AuditEventTypes.HodApproved : AuditEventTypes.HodRejected,
            $"HOD {decision} item {item.AccessItemId}.",
            reviewerId,
            ct);

        await UpdateAggregateStatusAsync(item.RequestId, reviewerId, now, ct);
        await db.SaveChangesAsync(ct);
    }

    public async Task RecordItDecisionAsync(
        int accessItemId,
        int reviewerId,
        ReviewDecision decision,
        string? note,
        CancellationToken ct = default)
    {
        var item = await db.AccessItems
            .Include(accessItem => accessItem.Request)
            .FirstOrDefaultAsync(accessItem => accessItem.AccessItemId == accessItemId && accessItem.IsActive, ct)
            ?? throw new InvalidOperationException("Access item not found.");

        if (item.Status != AccessItemStatus.PendingItReview)
        {
            throw new InvalidOperationException("HOD approval is required before IT review.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;

        item.Status = decision == ReviewDecision.Approved
            ? AccessItemStatus.Granted
            : AccessItemStatus.Rejected;
        item.ApprovedUntilUtc = decision == ReviewDecision.Approved
            ? now.AddDays(365)
            : null;
        item.UpdatedOn = now;
        item.ModifiedBy = reviewerId;

        db.AccessItemReviews.Add(new AccessItemReview
        {
            AccessItemId = item.AccessItemId,
            Stage = ReviewStage.ItTeam,
            ReviewerId = reviewerId,
            Note = note,
            CreatedOn = now,
            CreatedBy = reviewerId
        });

        await AppendAuditAsync(
            item.RequestId,
            decision == ReviewDecision.Approved ? AuditEventTypes.ItApproved : AuditEventTypes.ItRejected,
            $"IT {decision} item {item.AccessItemId}.",
            reviewerId,
            ct);

        await UpdateAggregateStatusAsync(item.RequestId, reviewerId, now, ct);
        await db.SaveChangesAsync(ct);
    }

    public async Task<AccessItem> ResubmitItemAsync(
        int rejectedItemId,
        string newFileName,
        string newFolderPath,
        AccessType accessType,
        int requesterId,
        CancellationToken ct = default)
    {
        var existingItem = await db.AccessItems
            .Include(accessItem => accessItem.Request)
            .FirstOrDefaultAsync(accessItem => accessItem.AccessItemId == rejectedItemId && accessItem.IsActive, ct)
            ?? throw new InvalidOperationException("Access item not found.");

        if (existingItem.Status != AccessItemStatus.Rejected)
        {
            throw new InvalidOperationException("Only rejected items can be resubmitted.");
        }

        var now = _clock.GetUtcNow().UtcDateTime;

        var newItem = new AccessItem
        {
            RequestId = existingItem.RequestId,
            FileName = newFileName,
            FolderPath = newFolderPath,
            AccessType = accessType,
            Status = AccessItemStatus.PendingHodReview,
            ParentAccessItemId = existingItem.AccessItemId,
            ResubmissionCount = existingItem.ResubmissionCount + 1,
            CreatedOn = now,
            CreatedBy = requesterId,
            UpdatedOn = now,
            ModifiedBy = requesterId
        };

        db.AccessItems.Add(newItem);

        await AppendAuditAsync(
            existingItem.RequestId,
            AuditEventTypes.RequestResubmitted,
            $"Item {existingItem.AccessItemId} resubmitted as a new access item.",
            requesterId,
            ct);

        await UpdateAggregateStatusAsync(existingItem.RequestId, requesterId, now, ct);
        await db.SaveChangesAsync(ct);

        return newItem;
    }

    public async Task ExpireOverdueItemsAsync(CancellationToken ct = default)
    {
        var now = _clock.GetUtcNow().UtcDateTime;

        var expiredItems = await db.AccessItems
            .Where(accessItem =>
                accessItem.IsActive &&
                accessItem.Status == AccessItemStatus.Granted &&
                accessItem.ApprovedUntilUtc.HasValue &&
                accessItem.ApprovedUntilUtc.Value < now)
            .ToListAsync(ct);

        foreach (var item in expiredItems)
        {
            item.Status = AccessItemStatus.Expired;
            item.UpdatedOn = now;

            await AppendAuditAsync(
                item.RequestId,
                AuditEventTypes.AccessExpired,
                $"Item {item.AccessItemId} expired at {item.ApprovedUntilUtc:O}.",
                actorId: 0,
                ct);
        }

        var requestIds = expiredItems
            .Select(item => item.RequestId)
            .Distinct()
            .ToList();

        foreach (var requestId in requestIds)
        {
            await UpdateAggregateStatusAsync(requestId, modifiedBy: 0, now, ct);
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task UpdateAggregateStatusAsync(
        int requestId,
        int modifiedBy,
        DateTime now,
        CancellationToken ct)
    {
        var statuses = await db.AccessItems
            .Where(accessItem => accessItem.RequestId == requestId && accessItem.IsActive)
            .Select(accessItem => accessItem.Status)
            .ToListAsync(ct);

        var request = await db.AccessRequests
            .FirstOrDefaultAsync(accessRequest => accessRequest.RequestId == requestId && accessRequest.IsActive, ct)
            ?? throw new InvalidOperationException("Access request not found.");

        request.AggregateStatus = statuses.Count == 0
            ? AccessRequestStatus.Pending
            : statuses.All(status => status == AccessItemStatus.Granted)
                ? AccessRequestStatus.Granted
                : statuses.All(status => status == AccessItemStatus.Rejected || status == AccessItemStatus.Expired)
                    ? AccessRequestStatus.Rejected
                    : AccessRequestStatus.Pending;

        request.UpdatedOn = now;
        request.ModifiedBy = modifiedBy;
    }

    private async Task AppendAuditAsync(
        int requestId,
        string eventType,
        string message,
        int actorId,
        CancellationToken ct)
    {
        await db.RequestAuditTrail.AddAsync(new RequestAuditTrail
        {
            RequestId = requestId,
            EventType = eventType,
            Message = message,
            CreatedOn = _clock.GetUtcNow().UtcDateTime,
            CreatedBy = actorId
        }, ct);
    }
}
