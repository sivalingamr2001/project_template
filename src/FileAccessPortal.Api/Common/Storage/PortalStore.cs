using FileAccessPortal.Api.Common.Errors;
using FileAccessPortal.Api.Common.Persistence;
using FileAccessPortal.Api.Common.Persistence.Entities;
using FileAccessPortal.Api.Common.Realtime;
using FileAccessPortal.Api.Common.Workflow;
using FileAccessPortal.Domain.Entities;
using FileAccessPortal.Domain.Enums;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace FileAccessPortal.Api.Common.Storage;

public sealed class PortalStore(
    AppDbContext dbContext,
    TimeProvider clock,
    ICamundaWorkflowClient camundaWorkflowClient,
    IHubContext<NotificationHub> hubContext,
    ILogger<PortalStore> logger)
{
    public sealed record AccessItemDraft(string FileName, string FolderPath, string AccessType, string BusinessReason);

    public async Task<IReadOnlyList<EmployeeEntity>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .OrderBy(user => user.Name)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<EmployeeEntity?> GetUserAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .SingleOrDefaultAsync(user => user.EmployeeId == employeeId, cancellationToken);
    }

    public async Task<EmployeeEntity?> GetUserByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return await dbContext.Employees
            .SingleOrDefaultAsync(user => user.EmployeeCode == employeeCode, cancellationToken);
    }

    public async Task<FileAccessRequest> CreateRequestAsync(
        int requestedByEmployeeId,
        IReadOnlyList<AccessItemDraft> items,
        CancellationToken cancellationToken)
    {
        if (items.Count == 0)
        {
            throw new ValidationException("At least one access item is required.");
        }

        var requester = await FindUserOrThrowAsync(requestedByEmployeeId, cancellationToken);
        var now = clock.GetUtcNow();
        var requestId = await NextRequestIdAsync(cancellationToken);
        var ticketNumber = $"FAR-{requestId:0000}";
        var nextAccessItemId = await NextAccessItemIdAsync(cancellationToken);

        var request = new AccessRequestEntity
        {
            RequestId = requestId,
            TicketNumber = ticketNumber,
            RequestedByEmployeeId = requester.EmployeeId,
            RequestedByName = requester.Name,
            DepartmentId = requester.DepartmentId,
            DepartmentName = requester.DepartmentName,
            AggregateStatus = FileAccessRequestStatus.PendingHodApproval.ToString(),
            RequestedAtUtc = now,
            IsActive = true,
            CreatedOn = now,
            CreatedBy = requester.EmployeeId
        };
        dbContext.Requests.Add(request);

        foreach (var item in items)
        {
            ValidateDraft(item);
            dbContext.AccessItems.Add(new AccessItemEntity
            {
                AccessItemId = nextAccessItemId++,
                RequestId = requestId,
                FileName = item.FileName.Trim(),
                FolderPath = item.FolderPath.Trim(),
                AccessType = item.AccessType.Trim(),
                BusinessReason = item.BusinessReason.Trim(),
                Status = FileAccessRequestStatus.PendingHodApproval.ToString(),
                VersionNo = 1,
                IsLatest = true,
                IsActive = true,
                CreatedOn = now,
                CreatedBy = requester.EmployeeId
            });
        }

        await AppendAuditAsync(
            requestId,
            null,
            AccessReviewStage.Requester,
            "request.created",
            $"Request {ticketNumber} created with {items.Count} access item(s).",
            requester.EmployeeId,
            requester.Name,
            null,
            now,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        await CreateNotificationsAsync(
            requestId,
            await GetLatestItemIdsForRequestAsync(requestId, cancellationToken),
            "request.created",
            $"{requester.Name} created request {ticketNumber}.",
            await dbContext.Employees.Where(user => user.Role == "Hod" && user.DepartmentId == requester.DepartmentId).ToArrayAsync(cancellationToken),
            AccessReviewStage.Hod,
            cancellationToken);

        var created = await BuildRequestDomainAsync(requestId, cancellationToken);
        var camunda = await camundaWorkflowClient.StartAccessRequestAsync(created, cancellationToken);
        request.CamundaBusinessKey = camunda.BusinessKey;
        request.CamundaProcessInstanceId = camunda.ProcessInstanceId;
        request.CamundaLastAction = camunda.LastAction;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await BuildRequestDomainAsync(requestId, cancellationToken);
    }

    public async Task<FileAccessRequest> ReviewAccessItemByHodAsync(
        int requestId,
        int accessItemId,
        int reviewerEmployeeId,
        bool approved,
        string? note,
        CancellationToken cancellationToken)
    {
        var reviewer = await FindUserOrThrowAsync(reviewerEmployeeId, cancellationToken);
        if (reviewer.Role != "Hod")
        {
            throw new ForbiddenException("Only HOD users can review access items.");
        }

        var request = await FindRequestOrThrowAsync(requestId, cancellationToken);
        if (request.DepartmentId != reviewer.DepartmentId)
        {
            throw new ForbiddenException("HOD can review only items from their department.");
        }

        var item = await FindLatestItemOrThrowAsync(requestId, accessItemId, cancellationToken);
        if (!string.Equals(item.Status, FileAccessRequestStatus.PendingHodApproval.ToString(), StringComparison.Ordinal))
        {
            throw new ValidationException("Only items pending HOD approval can be reviewed by HOD.");
        }

        var now = clock.GetUtcNow();
        item.HodReviewerEmployeeId = reviewer.EmployeeId;
        item.HodReviewerName = reviewer.Name;
        item.HodReviewedAtUtc = now;
        item.HodNote = Normalize(note);
        item.RejectionReason = approved ? null : Normalize(note);
        item.RejectedByStage = approved ? null : AccessReviewStage.Hod.ToString();
        item.Status = approved ? FileAccessRequestStatus.PendingItGrant.ToString() : FileAccessRequestStatus.PendingUserResubmission.ToString();
        item.UpdatedOn = now;
        item.UpdatedBy = reviewer.EmployeeId;

        dbContext.Approvals.Add(new ApprovalEntity
        {
            ApprovalId = await NextApprovalIdAsync(cancellationToken),
            AccessItemId = item.AccessItemId,
            Stage = AccessReviewStage.Hod.ToString(),
            StageOrder = 1,
            ReviewerId = reviewer.EmployeeId,
            Decision = approved ? "Approved" : "Rejected",
            Note = Normalize(note),
            CreatedOn = now,
            CreatedBy = reviewer.EmployeeId
        });

        await AppendAuditAsync(
            requestId,
            item.AccessItemId,
            AccessReviewStage.Hod,
            approved ? "hod.approved" : "hod.rejected",
            approved ? $"HOD approved access item {item.AccessItemId}." : $"HOD rejected access item {item.AccessItemId}.",
            reviewer.EmployeeId,
            reviewer.Name,
            note,
            now,
            cancellationToken);

        request.AggregateStatus = await CalculateAggregateStatusAsync(requestId, cancellationToken);
        request.UpdatedOn = now;
        request.UpdatedBy = reviewer.EmployeeId;
        var domain = await BuildRequestDomainAsync(requestId, cancellationToken);
        var camunda = await camundaWorkflowClient.PublishStateChangeAsync(domain, approved ? "HodApproved" : "HodRejected", cancellationToken);
        request.CamundaBusinessKey = camunda.BusinessKey;
        request.CamundaProcessInstanceId = camunda.ProcessInstanceId;
        request.CamundaLastAction = camunda.LastAction;

        await dbContext.SaveChangesAsync(cancellationToken);

        await CreateNotificationsAsync(
            requestId,
            new[] { item.AccessItemId },
            approved ? "hod.approved" : "hod.rejected",
            approved ? $"HOD approved access item {item.AccessItemId}." : $"HOD rejected access item {item.AccessItemId}.",
            approved
                ? await dbContext.Employees.Where(user => user.Role == "ItTeam").ToArrayAsync(cancellationToken)
                : await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId).ToArrayAsync(cancellationToken),
            approved ? AccessReviewStage.ItTeam : AccessReviewStage.Requester,
            cancellationToken);

        return await BuildRequestDomainAsync(requestId, cancellationToken);
    }

    public async Task<FileAccessRequest> ReviewAccessItemByItAsync(
        int requestId,
        int accessItemId,
        int reviewerEmployeeId,
        bool approved,
        string? note,
        CancellationToken cancellationToken)
    {
        var reviewer = await FindUserOrThrowAsync(reviewerEmployeeId, cancellationToken);
        if (reviewer.Role != "ItTeam")
        {
            throw new ForbiddenException("Only IT team users can review access items.");
        }

        var request = await FindRequestOrThrowAsync(requestId, cancellationToken);
        var item = await FindLatestItemOrThrowAsync(requestId, accessItemId, cancellationToken);
        if (!string.Equals(item.Status, FileAccessRequestStatus.PendingItGrant.ToString(), StringComparison.Ordinal))
        {
            throw new ValidationException("Only items approved by HOD can be reviewed by IT.");
        }

        var now = clock.GetUtcNow();
        item.ItReviewerEmployeeId = reviewer.EmployeeId;
        item.ItReviewerName = reviewer.Name;
        item.ItReviewedAtUtc = now;
        item.ItNote = Normalize(note);
        item.RejectionReason = approved ? null : Normalize(note);
        item.RejectedByStage = approved ? null : AccessReviewStage.ItTeam.ToString();
        item.Status = approved ? FileAccessRequestStatus.Granted.ToString() : FileAccessRequestStatus.PendingUserResubmission.ToString();
        item.ApprovedUntilUtc = approved ? now.AddDays(365) : null;
        item.RevokedAtUtc = null;
        item.UpdatedOn = now;
        item.UpdatedBy = reviewer.EmployeeId;

        dbContext.Approvals.Add(new ApprovalEntity
        {
            ApprovalId = await NextApprovalIdAsync(cancellationToken),
            AccessItemId = item.AccessItemId,
            Stage = AccessReviewStage.ItTeam.ToString(),
            StageOrder = 2,
            ReviewerId = reviewer.EmployeeId,
            Decision = approved ? "Approved" : "Rejected",
            Note = Normalize(note),
            CreatedOn = now,
            CreatedBy = reviewer.EmployeeId
        });

        await AppendAuditAsync(
            requestId,
            item.AccessItemId,
            AccessReviewStage.ItTeam,
            approved ? "it.approved" : "it.rejected",
            approved ? $"IT granted access for item {item.AccessItemId} for 365 days." : $"IT rejected access item {item.AccessItemId}.",
            reviewer.EmployeeId,
            reviewer.Name,
            note,
            now,
            cancellationToken);

        request.AggregateStatus = await CalculateAggregateStatusAsync(requestId, cancellationToken);
        request.UpdatedOn = now;
        request.UpdatedBy = reviewer.EmployeeId;
        var domain = await BuildRequestDomainAsync(requestId, cancellationToken);
        var camunda = await camundaWorkflowClient.PublishStateChangeAsync(domain, approved ? "ItApproved" : "ItRejected", cancellationToken);
        request.CamundaBusinessKey = camunda.BusinessKey;
        request.CamundaProcessInstanceId = camunda.ProcessInstanceId;
        request.CamundaLastAction = camunda.LastAction;

        await dbContext.SaveChangesAsync(cancellationToken);

        await CreateNotificationsAsync(
            requestId,
            new[] { item.AccessItemId },
            approved ? "it.approved" : "it.rejected",
            approved ? $"IT granted access item {item.AccessItemId}." : $"IT rejected access item {item.AccessItemId}.",
            approved
                ? await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId || user.Role == "ItTeam").ToArrayAsync(cancellationToken)
                : await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId || (user.Role == "Hod" && user.DepartmentId == request.DepartmentId)).ToArrayAsync(cancellationToken),
            approved ? AccessReviewStage.ItTeam : AccessReviewStage.Requester,
            cancellationToken);

        return await BuildRequestDomainAsync(requestId, cancellationToken);
    }

    public async Task<FileAccessRequest> ResubmitAccessItemAsync(
        int requestId,
        int accessItemId,
        int requestedByEmployeeId,
        string accessType,
        string businessReason,
        CancellationToken cancellationToken)
    {
        var requester = await FindUserOrThrowAsync(requestedByEmployeeId, cancellationToken);
        var request = await FindRequestOrThrowAsync(requestId, cancellationToken);
        if (request.RequestedByEmployeeId != requester.EmployeeId)
        {
            throw new ForbiddenException("Only the original requester can resubmit items.");
        }

        var oldItem = await FindLatestItemOrThrowAsync(requestId, accessItemId, cancellationToken);
        if (!oldItem.Status.Equals(FileAccessRequestStatus.PendingUserResubmission.ToString(), StringComparison.Ordinal) &&
            !oldItem.Status.Equals(FileAccessRequestStatus.Expired.ToString(), StringComparison.Ordinal))
        {
            throw new ValidationException("Only rejected or expired items can be resubmitted.");
        }

        var now = clock.GetUtcNow();
        oldItem.IsLatest = false;
        oldItem.UpdatedOn = now;
        oldItem.UpdatedBy = requester.EmployeeId;

        var newItemId = await NextAccessItemIdAsync(cancellationToken);
        var newItem = new AccessItemEntity
        {
            AccessItemId = newItemId,
            RequestId = requestId,
            FileName = oldItem.FileName,
            FolderPath = oldItem.FolderPath,
            AccessType = accessType.Trim(),
            BusinessReason = businessReason.Trim(),
            Status = FileAccessRequestStatus.PendingHodApproval.ToString(),
            ResubmissionCount = oldItem.ResubmissionCount + 1,
            ParentAccessItemId = oldItem.AccessItemId,
            VersionNo = oldItem.VersionNo + 1,
            IsLatest = true,
            IsActive = true,
            CreatedOn = now,
            CreatedBy = requester.EmployeeId
        };
        dbContext.AccessItems.Add(newItem);

        request.ResubmissionCount += 1;
        request.AggregateStatus = FileAccessRequestStatus.PendingHodApproval.ToString();
        request.UpdatedOn = now;
        request.UpdatedBy = requester.EmployeeId;

        await AppendAuditAsync(
            requestId,
            newItem.AccessItemId,
            AccessReviewStage.Requester,
            "item.resubmitted",
            $"Requester resubmitted access item {oldItem.AccessItemId} as version {newItem.VersionNo}.",
            requester.EmployeeId,
            requester.Name,
            businessReason,
            now,
            cancellationToken);

        var domain = await BuildRequestDomainAsync(requestId, cancellationToken);
        var camunda = await camundaWorkflowClient.PublishStateChangeAsync(domain, "ItemResubmitted", cancellationToken);
        request.CamundaBusinessKey = camunda.BusinessKey;
        request.CamundaProcessInstanceId = camunda.ProcessInstanceId;
        request.CamundaLastAction = camunda.LastAction;

        await dbContext.SaveChangesAsync(cancellationToken);

        await CreateNotificationsAsync(
            requestId,
            new[] { newItem.AccessItemId },
            "item.resubmitted",
            $"{requester.Name} resubmitted access item {newItem.AccessItemId}.",
            await dbContext.Employees.Where(user => user.Role == "Hod" && user.DepartmentId == requester.DepartmentId).ToArrayAsync(cancellationToken),
            AccessReviewStage.Hod,
            cancellationToken);

        return await BuildRequestDomainAsync(requestId, cancellationToken);
    }

    public async Task<FileAccessRequest> RenewAccessItemsAsync(
        int requestId,
        int requestedByEmployeeId,
        IReadOnlyList<int> accessItemIds,
        CancellationToken cancellationToken)
    {
        var requester = await FindUserOrThrowAsync(requestedByEmployeeId, cancellationToken);
        var sourceRequest = await FindRequestOrThrowAsync(requestId, cancellationToken);
        if (sourceRequest.RequestedByEmployeeId != requestedByEmployeeId)
        {
            throw new ForbiddenException("Only the original requester can create renewals.");
        }

        var sourceItems = await dbContext.AccessItems
            .Where(item => item.RequestId == requestId && item.IsLatest && accessItemIds.Contains(item.AccessItemId))
            .ToArrayAsync(cancellationToken);

        var renewable = sourceItems
            .Where(item => item.Status == FileAccessRequestStatus.Granted.ToString() || item.Status == FileAccessRequestStatus.Expired.ToString())
            .ToArray();

        if (renewable.Length == 0)
        {
            throw new ValidationException("No renewable access items were selected.");
        }

        var now = clock.GetUtcNow();
        var renewalId = await NextRequestIdAsync(cancellationToken);
        var renewal = new AccessRequestEntity
        {
            RequestId = renewalId,
            ParentRequestId = sourceRequest.RequestId,
            TicketNumber = $"FAR-{renewalId:0000}",
            RequestedByEmployeeId = requester.EmployeeId,
            RequestedByName = requester.Name,
            DepartmentId = requester.DepartmentId,
            DepartmentName = requester.DepartmentName,
            RequestedAtUtc = now,
            AggregateStatus = FileAccessRequestStatus.PendingHodApproval.ToString(),
            IsActive = true,
            CreatedOn = now,
            CreatedBy = requester.EmployeeId
        };
        dbContext.Requests.Add(renewal);

        var nextAccessItemId = await NextAccessItemIdAsync(cancellationToken);
        var renewalItemIds = new List<int>();
        foreach (var item in renewable)
        {
            var renewalItemId = nextAccessItemId++;
            renewalItemIds.Add(renewalItemId);
            dbContext.AccessItems.Add(new AccessItemEntity
            {
                AccessItemId = renewalItemId,
                RequestId = renewalId,
                FileName = item.FileName,
                FolderPath = item.FolderPath,
                AccessType = item.AccessType,
                BusinessReason = item.BusinessReason,
                Status = FileAccessRequestStatus.PendingHodApproval.ToString(),
                VersionNo = 1,
                IsLatest = true,
                IsActive = true,
                CreatedOn = now,
                CreatedBy = requester.EmployeeId
            });
        }

        await AppendAuditAsync(
            renewalId,
            null,
            AccessReviewStage.Requester,
            "request.renewal-created",
            $"Renewal request {renewal.TicketNumber} created.",
            requester.EmployeeId,
            requester.Name,
            null,
            now,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        var renewalDomain = await BuildRequestDomainAsync(renewalId, cancellationToken);
        var camunda = await camundaWorkflowClient.StartAccessRequestAsync(renewalDomain, cancellationToken);
        renewal.CamundaBusinessKey = camunda.BusinessKey;
        renewal.CamundaProcessInstanceId = camunda.ProcessInstanceId;
        renewal.CamundaLastAction = camunda.LastAction;
        await dbContext.SaveChangesAsync(cancellationToken);

        await CreateNotificationsAsync(
            renewalId,
            renewalItemIds,
            "request.renewal-created",
            $"{requester.Name} created renewal request {renewal.TicketNumber}.",
            await dbContext.Employees.Where(user => user.Role == "Hod" && user.DepartmentId == requester.DepartmentId).ToArrayAsync(cancellationToken),
            AccessReviewStage.Hod,
            cancellationToken);

        return await BuildRequestDomainAsync(renewalId, cancellationToken);
    }

    public async Task<FileAccessRequest> RevokeAccessItemAsync(
        int requestId,
        int accessItemId,
        int reviewerEmployeeId,
        string? note,
        CancellationToken cancellationToken)
    {
        var reviewer = await FindUserOrThrowAsync(reviewerEmployeeId, cancellationToken);
        if (reviewer.Role != "ItTeam")
        {
            throw new ForbiddenException("Only IT team users can revoke access items.");
        }

        var request = await FindRequestOrThrowAsync(requestId, cancellationToken);
        var item = await FindLatestItemOrThrowAsync(requestId, accessItemId, cancellationToken);
        if (!item.Status.Equals(FileAccessRequestStatus.Granted.ToString(), StringComparison.Ordinal))
        {
            throw new ValidationException("Only granted items can be revoked.");
        }

        var now = clock.GetUtcNow();
        item.Status = FileAccessRequestStatus.Revoked.ToString();
        item.RevokedAtUtc = now;
        item.RevokedBy = reviewer.EmployeeId;
        item.RevokeReason = Normalize(note);
        item.UpdatedOn = now;
        item.UpdatedBy = reviewer.EmployeeId;

        await AppendAuditAsync(
            requestId,
            item.AccessItemId,
            AccessReviewStage.ItTeam,
            "item.revoked",
            $"IT revoked access item {item.AccessItemId}.",
            reviewer.EmployeeId,
            reviewer.Name,
            note,
            now,
            cancellationToken);

        request.AggregateStatus = await CalculateAggregateStatusAsync(requestId, cancellationToken);
        request.UpdatedOn = now;
        request.UpdatedBy = reviewer.EmployeeId;
        var domain = await BuildRequestDomainAsync(requestId, cancellationToken);
        var camunda = await camundaWorkflowClient.PublishStateChangeAsync(domain, "AccessRevoked", cancellationToken);
        request.CamundaBusinessKey = camunda.BusinessKey;
        request.CamundaProcessInstanceId = camunda.ProcessInstanceId;
        request.CamundaLastAction = camunda.LastAction;

        await dbContext.SaveChangesAsync(cancellationToken);

        await CreateNotificationsAsync(
            requestId,
            new[] { item.AccessItemId },
            "it.revoked",
            $"{reviewer.Name} revoked access item {item.AccessItemId}.",
            await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId || (user.Role == "Hod" && user.DepartmentId == request.DepartmentId)).ToArrayAsync(cancellationToken),
            AccessReviewStage.ItTeam,
            cancellationToken);

        return await BuildRequestDomainAsync(requestId, cancellationToken);
    }

    public async Task<IReadOnlyList<FileAccessRequest>> GetVisibleRequestsAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        await ExpireGrantedItemsAsync(cancellationToken);
        var user = await FindUserOrThrowAsync(employeeId, cancellationToken);
        IQueryable<AccessRequestEntity> query = dbContext.Requests.AsNoTracking().Where(request => request.IsActive);

        query = user.Role switch
        {
            "User" => query.Where(request => request.RequestedByEmployeeId == employeeId),
            "Hod" => query.Where(request => request.DepartmentId == user.DepartmentId),
            "ItTeam" => query,
            _ => query.Where(_ => false)
        };

        var requestIds = await query
            .OrderByDescending(request => request.RequestedAtUtc)
            .Select(request => request.RequestId)
            .ToArrayAsync(cancellationToken);

        var result = new List<FileAccessRequest>(requestIds.Length);
        foreach (var requestId in requestIds)
        {
            result.Add(await BuildRequestDomainAsync(requestId, cancellationToken));
        }

        return result;
    }

    public async Task<IReadOnlyList<NotificationEntity>> GetVisibleNotificationsAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var notifications = await dbContext.Notifications
            .AsNoTracking()
            .Where(notification => notification.RecipientEmployeeId == employeeId)
            .Take(20)
            .ToArrayAsync(cancellationToken);

        return notifications
            .OrderByDescending(notification => notification.CreatedAtUtc)
            .ToArray();
    }

    private async Task<FileAccessRequest> BuildRequestDomainAsync(int requestId, CancellationToken cancellationToken)
    {
        var request = await FindRequestOrThrowAsync(requestId, cancellationToken);
        var items = await dbContext.AccessItems
            .AsNoTracking()
            .Where(item => item.RequestId == requestId && item.IsLatest && item.IsActive)
            .OrderBy(item => item.AccessItemId)
            .ToArrayAsync(cancellationToken);
        var audits = await dbContext.AuditLogs
            .AsNoTracking()
            .Where(log => log.RequestId == requestId)
            .OrderBy(log => log.HappenedAtUtc)
            .ToArrayAsync(cancellationToken);

        return new FileAccessRequest
        {
            RequestId = request.RequestId,
            ParentRequestId = request.ParentRequestId,
            TicketNumber = request.TicketNumber,
            RequestedByEmployeeId = request.RequestedByEmployeeId,
            RequestedByName = request.RequestedByName,
            DepartmentId = request.DepartmentId,
            DepartmentName = request.DepartmentName,
            RequestedAtUtc = request.RequestedAtUtc,
            Camunda = request.CamundaBusinessKey is null && request.CamundaProcessInstanceId is null && request.CamundaLastAction is null
                ? null
                : new CamundaProcessReference(
                    request.CamundaBusinessKey ?? string.Empty,
                    request.CamundaProcessInstanceId,
                    request.CamundaLastAction ?? "Unknown",
                    request.UpdatedOn ?? request.CreatedOn,
                    !string.IsNullOrWhiteSpace(request.CamundaProcessInstanceId)),
            Items = items.Select(ToDomainItem).ToList(),
            AuditTrail = audits.Select(ToDomainAudit).ToList()
        };
    }

    private static AccessRequestItem ToDomainItem(AccessItemEntity entity)
    {
        return new AccessRequestItem
        {
            AccessItemId = entity.AccessItemId,
            FileName = entity.FileName,
            FolderPath = entity.FolderPath,
            AccessType = entity.AccessType,
            BusinessReason = entity.BusinessReason,
            Status = Enum.Parse<FileAccessRequestStatus>(entity.Status, true),
            ResubmissionCount = entity.ResubmissionCount,
            ApprovedUntilUtc = entity.ApprovedUntilUtc,
            RevokedAtUtc = entity.RevokedAtUtc,
            RejectionReason = entity.RejectionReason,
            RejectedByStage = string.IsNullOrWhiteSpace(entity.RejectedByStage) ? null : Enum.Parse<AccessReviewStage>(entity.RejectedByStage, true),
            HodReviewerEmployeeId = entity.HodReviewerEmployeeId,
            HodReviewerName = entity.HodReviewerName,
            HodReviewedAtUtc = entity.HodReviewedAtUtc,
            HodNote = entity.HodNote,
            ItReviewerEmployeeId = entity.ItReviewerEmployeeId,
            ItReviewerName = entity.ItReviewerName,
            ItReviewedAtUtc = entity.ItReviewedAtUtc,
            ItNote = entity.ItNote
        };
    }

    private static AccessAuditLog ToDomainAudit(AuditLogEntity entity)
    {
        return new AccessAuditLog(
            entity.AuditId,
            entity.RequestId,
            entity.AccessItemId,
            entity.HappenedAtUtc,
            Enum.Parse<AccessReviewStage>(entity.Stage, true),
            entity.EventType,
            entity.Message,
            entity.ActorEmployeeId,
            entity.ActorName,
            entity.Comments);
    }

    private async Task<EmployeeEntity> FindUserOrThrowAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees.SingleOrDefaultAsync(user => user.EmployeeId == employeeId, cancellationToken)
            ?? throw new NotFoundException("User was not found.");
    }

    private async Task<AccessRequestEntity> FindRequestOrThrowAsync(int requestId, CancellationToken cancellationToken)
    {
        return await dbContext.Requests.SingleOrDefaultAsync(request => request.RequestId == requestId, cancellationToken)
            ?? throw new NotFoundException("Request was not found.");
    }

    private async Task<AccessItemEntity> FindLatestItemOrThrowAsync(int requestId, int accessItemId, CancellationToken cancellationToken)
    {
        return await dbContext.AccessItems.SingleOrDefaultAsync(item => item.RequestId == requestId && item.AccessItemId == accessItemId && item.IsLatest && item.IsActive, cancellationToken)
            ?? throw new NotFoundException("Access item was not found.");
    }

    private static void ValidateDraft(AccessItemDraft item)
    {
        if (string.IsNullOrWhiteSpace(item.FileName) ||
            string.IsNullOrWhiteSpace(item.FolderPath) ||
            string.IsNullOrWhiteSpace(item.AccessType) ||
            string.IsNullOrWhiteSpace(item.BusinessReason))
        {
            throw new ValidationException("Each access item requires file name, folder path, access type, and business reason.");
        }
    }

    private async Task<int> NextRequestIdAsync(CancellationToken cancellationToken)
    {
        var max = await dbContext.Requests.MaxAsync(request => (int?)request.RequestId, cancellationToken) ?? 1000;
        return max + 1;
    }

    private async Task<int> NextAccessItemIdAsync(CancellationToken cancellationToken)
    {
        var max = await dbContext.AccessItems.MaxAsync(item => (int?)item.AccessItemId, cancellationToken) ?? 5000;
        return max + 1;
    }

    private async Task<int> NextApprovalIdAsync(CancellationToken cancellationToken)
    {
        var max = await dbContext.Approvals.MaxAsync(item => (int?)item.ApprovalId, cancellationToken) ?? 0;
        return max + 1;
    }

    private async Task<int> NextAuditIdAsync(CancellationToken cancellationToken)
    {
        var max = await dbContext.AuditLogs.MaxAsync(log => (int?)log.AuditId, cancellationToken) ?? 0;
        return max + 1;
    }

    private async Task<IReadOnlyList<int>> GetLatestItemIdsForRequestAsync(int requestId, CancellationToken cancellationToken)
    {
        return await dbContext.AccessItems
            .AsNoTracking()
            .Where(item => item.RequestId == requestId && item.IsLatest && item.IsActive)
            .Select(item => item.AccessItemId)
            .ToArrayAsync(cancellationToken);
    }

    private async Task<string> CalculateAggregateStatusAsync(int requestId, CancellationToken cancellationToken)
    {
        var statuses = await dbContext.AccessItems
            .AsNoTracking()
            .Where(item => item.RequestId == requestId && item.IsLatest && item.IsActive)
            .Select(item => item.Status)
            .ToArrayAsync(cancellationToken);

        if (statuses.Length == 0)
        {
            return FileAccessRequestStatus.PendingHodApproval.ToString();
        }

        if (statuses.Any(status => status == FileAccessRequestStatus.PendingUserResubmission.ToString()))
        {
            return FileAccessRequestStatus.PendingUserResubmission.ToString();
        }

        if (statuses.Any(status => status == FileAccessRequestStatus.PendingHodApproval.ToString()))
        {
            return FileAccessRequestStatus.PendingHodApproval.ToString();
        }

        if (statuses.Any(status => status == FileAccessRequestStatus.PendingItGrant.ToString()))
        {
            return FileAccessRequestStatus.PendingItGrant.ToString();
        }

        if (statuses.All(status => status == FileAccessRequestStatus.Granted.ToString()))
        {
            return FileAccessRequestStatus.Granted.ToString();
        }

        if (statuses.All(status => status == FileAccessRequestStatus.Revoked.ToString()))
        {
            return FileAccessRequestStatus.Revoked.ToString();
        }

        if (statuses.All(status => status == FileAccessRequestStatus.Expired.ToString()))
        {
            return FileAccessRequestStatus.Expired.ToString();
        }

        return statuses[0];
    }

    private async Task AppendAuditAsync(
        int requestId,
        int? accessItemId,
        AccessReviewStage stage,
        string eventType,
        string message,
        int? actorEmployeeId,
        string? actorName,
        string? comments,
        DateTimeOffset happenedAtUtc,
        CancellationToken cancellationToken)
    {
        dbContext.AuditLogs.Add(new AuditLogEntity
        {
            AuditId = await NextAuditIdAsync(cancellationToken),
            RequestId = requestId,
            AccessItemId = accessItemId,
            Stage = stage.ToString(),
            EventType = eventType,
            Message = message,
            ActorEmployeeId = actorEmployeeId,
            ActorName = actorName,
            Comments = Normalize(comments),
            HappenedAtUtc = happenedAtUtc
        });
    }

    private async Task CreateNotificationsAsync(
        int requestId,
        IReadOnlyList<int> accessItemIds,
        string eventType,
        string message,
        IReadOnlyList<EmployeeEntity> recipients,
        AccessReviewStage stage,
        CancellationToken cancellationToken)
    {
        var nextNotificationId = await dbContext.Notifications.MaxAsync(notification => (int?)notification.Id, cancellationToken) ?? 8000;
        var created = new List<NotificationEntity>();

        foreach (var recipient in recipients.DistinctBy(user => user.EmployeeId))
        {
            foreach (var accessItemId in accessItemIds)
            {
                var notification = new NotificationEntity
                {
                    Id = ++nextNotificationId,
                    RequestId = requestId,
                    AccessItemId = accessItemId,
                    RecipientEmployeeId = recipient.EmployeeId,
                    RecipientName = recipient.Name,
                    RecipientStage = stage.ToString(),
                    EventType = eventType,
                    Message = message,
                    CreatedAtUtc = clock.GetUtcNow()
                };

                dbContext.Notifications.Add(notification);
                created.Add(notification);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var notification in created)
        {
            await hubContext.Clients
                .Group(NotificationHub.GroupName(notification.RecipientEmployeeId))
                .SendAsync("notification.created", notification.ToSignalrPayload(), cancellationToken);
        }
    }

    private async Task ExpireGrantedItemsAsync(CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var expiring = await dbContext.AccessItems
            .Where(item => item.IsLatest &&
                           item.IsActive &&
                           item.Status == FileAccessRequestStatus.Granted.ToString() &&
                           item.ApprovedUntilUtc.HasValue &&
                           item.ApprovedUntilUtc.Value <= now)
            .ToArrayAsync(cancellationToken);

        if (expiring.Length == 0)
        {
            return;
        }

        var changedRequestIds = new HashSet<int>();
        foreach (var item in expiring)
        {
            item.Status = FileAccessRequestStatus.Expired.ToString();
            item.UpdatedOn = now;
            changedRequestIds.Add(item.RequestId);

            await AppendAuditAsync(
                item.RequestId,
                item.AccessItemId,
                AccessReviewStage.System,
                "item.expired",
                $"Access item {item.AccessItemId} expired and requires renewal.",
                null,
                "System",
                null,
                now,
                cancellationToken);
        }

        foreach (var requestId in changedRequestIds)
        {
            var request = await FindRequestOrThrowAsync(requestId, cancellationToken);
            request.AggregateStatus = await CalculateAggregateStatusAsync(requestId, cancellationToken);
            request.UpdatedOn = now;

            var recipients = await dbContext.Employees
                .Where(user => user.EmployeeId == request.RequestedByEmployeeId ||
                               (user.Role == "Hod" && user.DepartmentId == request.DepartmentId) ||
                               user.Role == "ItTeam")
                .ToArrayAsync(cancellationToken);
            var expiredIds = expiring.Where(item => item.RequestId == requestId).Select(item => item.AccessItemId).ToArray();
            await CreateNotificationsAsync(
                requestId,
                expiredIds,
                "item.expired",
                "Access item expired and needs renewal.",
                recipients,
                AccessReviewStage.System,
                cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Expired {Count} access item(s)", expiring.Length);
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}

internal static class NotificationEntityMappingExtensions
{
    public static object ToSignalrPayload(this NotificationEntity notification)
    {
        return new
        {
            notification.Id,
            notification.RequestId,
            notification.AccessItemId,
            notification.EventType,
            notification.Message,
            notification.RecipientStage,
            notification.CreatedAtUtc,
            notification.IsRead
        };
    }
}
