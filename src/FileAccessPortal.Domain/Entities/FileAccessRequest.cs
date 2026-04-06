using System.Threading;
using FileAccessPortal.Domain.Enums;

namespace FileAccessPortal.Domain.Entities;

public sealed class FileAccessRequest
{
    private static int _auditSequence;

    public int RequestId { get; init; }
    public int? ParentRequestId { get; set; }
    public string TicketNumber { get; init; } = string.Empty;
    public int RequestedByEmployeeId { get; init; }
    public string RequestedByName { get; init; } = string.Empty;
    public int DepartmentId { get; init; }
    public string DepartmentName { get; init; } = string.Empty;
    public DateTimeOffset RequestedAtUtc { get; init; }
    public CamundaProcessReference? Camunda { get; set; }
    public List<AccessRequestItem> Items { get; set; } = [];
    public List<AccessAuditLog> AuditTrail { get; set; } = [];

    public FileAccessRequestStatus AggregateStatus
    {
        get
        {
            if (Items.Count == 0)
            {
                return FileAccessRequestStatus.PendingHodApproval;
            }

            if (Items.Any(item => item.Status == FileAccessRequestStatus.PendingUserResubmission))
            {
                return FileAccessRequestStatus.PendingUserResubmission;
            }

            if (Items.Any(item => item.Status == FileAccessRequestStatus.PendingHodApproval))
            {
                return FileAccessRequestStatus.PendingHodApproval;
            }

            if (Items.Any(item => item.Status == FileAccessRequestStatus.PendingItGrant))
            {
                return FileAccessRequestStatus.PendingItGrant;
            }

            if (Items.All(item => item.Status == FileAccessRequestStatus.Granted))
            {
                return FileAccessRequestStatus.Granted;
            }

            if (Items.All(item => item.Status == FileAccessRequestStatus.Revoked))
            {
                return FileAccessRequestStatus.Revoked;
            }

            if (Items.All(item => item.Status == FileAccessRequestStatus.Expired))
            {
                return FileAccessRequestStatus.Expired;
            }

            return Items.First().Status;
        }
    }

    public static FileAccessRequest Create(
        int requestId,
        string ticketNumber,
        AppUser requestedBy,
        IEnumerable<AccessRequestItem> items,
        DateTimeOffset requestedAtUtc,
        int? parentRequestId = null)
    {
        var request = new FileAccessRequest
        {
            RequestId = requestId,
            ParentRequestId = parentRequestId,
            TicketNumber = ticketNumber,
            RequestedByEmployeeId = requestedBy.EmployeeId,
            RequestedByName = requestedBy.Name,
            DepartmentId = requestedBy.DepartmentId,
            DepartmentName = requestedBy.DepartmentName,
            RequestedAtUtc = requestedAtUtc
        };

        request.Items.AddRange(items);
        request.AddAudit(
            null,
            requestedAtUtc,
            AccessReviewStage.Requester,
            "request.created",
            $"Request {ticketNumber} created with {request.Items.Count} access item(s).",
            requestedBy.EmployeeId,
            requestedBy.Name,
            null);

        return request;
    }

    public AccessRequestItem ReviewItemByHod(int accessItemId, AppUser reviewer, bool approved, string? note, DateTimeOffset reviewedAtUtc)
    {
        var item = FindItem(accessItemId);
        item.ReviewByHod(reviewer, approved, note, reviewedAtUtc);

        AddAudit(
            accessItemId,
            reviewedAtUtc,
            AccessReviewStage.Hod,
            approved ? "hod.approved" : "hod.rejected",
            approved
                ? $"HOD approved access item {accessItemId}."
                : $"HOD rejected access item {accessItemId}.",
            reviewer.EmployeeId,
            reviewer.Name,
            note);

        return item;
    }

    public AccessRequestItem ReviewItemByIt(int accessItemId, AppUser reviewer, bool approved, string? note, DateTimeOffset reviewedAtUtc)
    {
        var item = FindItem(accessItemId);
        item.ReviewByIt(reviewer, approved, note, reviewedAtUtc);

        AddAudit(
            accessItemId,
            reviewedAtUtc,
            AccessReviewStage.ItTeam,
            approved ? "it.approved" : "it.rejected",
            approved
                ? $"IT granted access for item {accessItemId} for 365 days."
                : $"IT rejected access item {accessItemId}.",
            reviewer.EmployeeId,
            reviewer.Name,
            note);

        return item;
    }

    public AccessRequestItem ResubmitItem(int accessItemId, AppUser requester, string accessType, string businessReason, DateTimeOffset submittedAtUtc)
    {
        if (requester.EmployeeId != RequestedByEmployeeId)
        {
            throw new InvalidOperationException("Only the original requester can resubmit items.");
        }

        var item = FindItem(accessItemId);
        item.Resubmit(accessType, businessReason);

        AddAudit(
            accessItemId,
            submittedAtUtc,
            AccessReviewStage.Requester,
            "item.resubmitted",
            $"Requester resubmitted access item {accessItemId}.",
            requester.EmployeeId,
            requester.Name,
            businessReason);

        return item;
    }

    public AccessRequestItem RevokeItem(int accessItemId, AppUser reviewer, string? note, DateTimeOffset revokedAtUtc)
    {
        var item = FindItem(accessItemId);
        item.Revoke(revokedAtUtc);

        AddAudit(
            accessItemId,
            revokedAtUtc,
            AccessReviewStage.ItTeam,
            "item.revoked",
            $"IT revoked access item {accessItemId}.",
            reviewer.EmployeeId,
            reviewer.Name,
            note);

        return item;
    }

    public void ExpireItems(DateTimeOffset now)
    {
        foreach (var item in Items)
        {
            var priorStatus = item.Status;
            item.Expire(now);
            if (priorStatus != item.Status && item.Status == FileAccessRequestStatus.Expired)
            {
                AddAudit(
                    item.AccessItemId,
                    now,
                    AccessReviewStage.System,
                    "item.expired",
                    $"Access item {item.AccessItemId} expired and requires renewal.",
                    null,
                    "System",
                    null);
            }
        }
    }

    public FileAccessRequest CreateRenewal(
        int requestId,
        string ticketNumber,
        AppUser requester,
        IEnumerable<int> renewedItemIds,
        DateTimeOffset createdAtUtc)
    {
        var newItems = renewedItemIds
            .Zip(Items.Where(item => item.Status is FileAccessRequestStatus.Granted or FileAccessRequestStatus.Expired),
                (newId, source) => source.CreateRenewal(newId))
            .ToArray();

        if (newItems.Length == 0)
        {
            throw new InvalidOperationException("No renewable access items were found.");
        }

        return Create(requestId, ticketNumber, requester, newItems, createdAtUtc, RequestId);
    }

    public void AttachCamunda(CamundaProcessReference processReference)
    {
        Camunda = processReference;
    }

    private AccessRequestItem FindItem(int accessItemId)
    {
        return Items.SingleOrDefault(item => item.AccessItemId == accessItemId)
            ?? throw new InvalidOperationException("Access item was not found.");
    }

    private void AddAudit(
        int? accessItemId,
        DateTimeOffset happenedAtUtc,
        AccessReviewStage stage,
        string eventType,
        string message,
        int? actorEmployeeId,
        string? actorName,
        string? comments)
    {
        AuditTrail.Add(new AccessAuditLog(
            Interlocked.Increment(ref _auditSequence),
            RequestId,
            accessItemId,
            happenedAtUtc,
            stage,
            eventType,
            message,
            actorEmployeeId,
            actorName,
            Normalize(comments)));
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
