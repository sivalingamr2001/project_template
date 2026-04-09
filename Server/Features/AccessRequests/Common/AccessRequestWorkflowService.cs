using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Common.Realtime;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetDetails;
using Server.Features.AccessRequests.Renew;
using Server.Features.AccessRequests.ReviewByHod;
using Server.Features.AccessRequests.ReviewByIt;
using Server.Features.AccessRequests.Revoke;
using Server.Features.Notifications.GetList;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Exceptions;

namespace Server.Features.AccessRequests.Common;

public sealed class AccessRequestWorkflowService(
    AppDbContext dbContext,
    IHubContext<NotificationHub> hubContext)
{
    public async Task<CreateAccessRequestResponse> CreateOrUpdateAsync(CreateAccessRequest request, CancellationToken cancellationToken)
    {
        ValidateCreateRequest(request);

        var requester = await GetEmployeeOrThrowAsync(request.EmpId, cancellationToken);
        var hodApprover = await ResolveHodApproverAsync(requester.DepartmentId, request.ReqTo, cancellationToken);
        var utcNow = DateTime.UtcNow;

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        AccessRequestEntity accessRequest;
        bool isUpdate = request.AccessReqId > 0;

        if (isUpdate)
        {
            // 1. Fetch parent INCLUDING existing items
            accessRequest = await dbContext.AccessRequests
                .Include(x => x.AccessItems) // Ensure items are loaded for replacement
                .FirstOrDefaultAsync(x => x.AccessReqId == request.AccessReqId, cancellationToken)
                ?? throw new Exception($"Request {request.AccessReqId} not found.");

            // 2. Clear existing items from the tracked collection
            // EF will handle the deletion of orphans if configured, or you can RemoveRange
            dbContext.AccessItems.RemoveRange(accessRequest.AccessItems);
            accessRequest.AccessItems.Clear();
        }
        else
        {
            accessRequest = new AccessRequestEntity
            {
                CreatedBy = requester.EmployeeId.ToString(),
                CreatedOn = utcNow,
                AccessItems = new List<AccessItemEntity>() // Initialize list
            };
            dbContext.AccessRequests.Add(accessRequest);
        }

        // 3. Update Parent Properties (Updates the existing tracked object)
        accessRequest.EmpId = requester.EmployeeId;
        accessRequest.ReqTo = hodApprover.EmployeeId;
        accessRequest.ItsrNo = request.ItsrNo?.Trim() ?? string.Empty;
        accessRequest.IsAgreed = true;
        accessRequest.AggregateStatus = AggregateRequestStatus.Pending;
        accessRequest.Status = RequestStatus.PendingHOD;
        accessRequest.ModifiedBy = requester.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        // 4. Map and Add New Items to the collection
        foreach (var item in request.Items)
        {
            accessRequest.AccessItems.Add(new AccessItemEntity
            {
                AccessReqId = accessRequest.AccessReqId, // This will be set correctly by EF for new or existing parent
                FolderPath = item.FolderPath.Trim(),
                AccessType = (AccessTypes)item.AccessType,
                ConfirmAccessType = AccessTypes.NotApplicable,
                HodValidationStatus = AggregateRequestStatus.Pending,
                HodValidationComments = string.Empty,
                IsHodValidated = false,
                Reason = item.Reason.Trim(),
                CreatedBy = requester.EmployeeId.ToString(),
                CreatedOn = utcNow,
                ModifiedBy = requester.EmployeeId.ToString(),
                ModifiedOn = utcNow
            });
        }

        // 5. Single SaveChanges handles both Table updates (Delete old, Update Parent, Insert New)
        await dbContext.SaveChangesAsync(cancellationToken);

        // 6. Audit and Finalize
        var actionKey = isUpdate ? "request.updated" : "request.submitted";
        var message = $"{requester.Name} {(isUpdate ? "updated" : "submitted")} access request #{accessRequest.AccessReqId}.";
        var recipients = new[] { requester, hodApprover };

        await AddAuditEntriesAsync(accessRequest.AccessReqId, null, null, actionKey, message, recipients, requester.EmployeeId.ToString(), utcNow, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await PushNotificationsAsync(recipients, accessRequest.AccessReqId, actionKey, message, utcNow, cancellationToken);

        return new CreateAccessRequestResponse(accessRequest.AccessReqId, accessRequest.Status.ToString());
            }

    public async Task<ReviewAccessRequestResponse> ReviewByHodAsync(int accessReqId, ReviewByHodRequest request, CancellationToken cancellationToken)
    {
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (request.Items.Count == 0)
        {
            throw new AppValidationException("HOD must review all child access items before submitting.");
        }

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.Hod, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);

        if (accessRequest.Status != RequestStatus.PendingHOD)
        {
            throw new AppValidationException("Only requests pending HOD review can be reviewed by HOD.");
        }

        var accessItems = await dbContext.AccessItems
            .Where(item => item.AccessReqId == accessReqId)
            .OrderBy(item => item.AccessItemId)
            .ToListAsync(cancellationToken);

        if (accessItems.Count == 0)
        {
            throw new AppValidationException("Access item details not found for this request.");
        }

        var submittedItems = request.Items
            .GroupBy(item => item.AccessItemId)
            .Select(group => group.Last())
            .ToDictionary(item => item.AccessItemId);

        if (submittedItems.Count != accessItems.Count || accessItems.Any(item => !submittedItems.ContainsKey(item.AccessItemId)))
        {
            throw new AppValidationException("HOD must validate every child access item before submitting.");
        }

        var utcNow = DateTime.UtcNow;
        var rejectedItems = new List<AccessItemEntity>();
        var approvedItems = new List<AccessItemEntity>();

        foreach (var accessItem in accessItems)
        {
            var reviewItem = submittedItems[accessItem.AccessItemId];

            if (!reviewItem.IsValidated)
            {
                throw new AppValidationException($"Access item #{accessItem.AccessItemId} is not marked as validated.");
            }

            if (!reviewItem.Approved && string.IsNullOrWhiteSpace(reviewItem.Comments))
            {
                throw new AppValidationException($"Comments are required when rejecting access item #{accessItem.AccessItemId}.");
            }

            accessItem.IsHodValidated = true;
            accessItem.HodValidationStatus = reviewItem.Approved
                ? AggregateRequestStatus.Approved
                : AggregateRequestStatus.Rejected;
            accessItem.HodValidationComments = reviewItem.Comments?.Trim() ?? string.Empty;
            accessItem.ConfirmAccessType = reviewItem.Approved
                ? reviewItem.ConfirmAccessType
                : AccessTypes.NotApplicable;
            accessItem.ModifiedBy = reviewer.EmployeeId.ToString();
            accessItem.ModifiedOn = utcNow;

            if (reviewItem.Approved)
            {
                approvedItems.Add(accessItem);
            }
            else
            {
                rejectedItems.Add(accessItem);
            }
        }

        var requestApproved = rejectedItems.Count == 0;
        var status = requestApproved ? RequestStatus.ApprovedHOD : RequestStatus.RejectedHOD;
        var summaryComment = requestApproved
            ? $"HOD validated {approvedItems.Count} child access item(s)."
            : $"HOD validated {approvedItems.Count} child access item(s) and rejected {rejectedItems.Count} item(s).";

        dbContext.AccessApprovals.Add(new AccessApprovalEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            ApproverId = reviewer.EmployeeId,
            ApprovalStatus = status,
            Comments = summaryComment,
            CreatedBy = reviewer.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = reviewer.EmployeeId.ToString(),
            ModifiedOn = utcNow
        });

        EmployeeEntity[] recipients;
        string eventType;
        string message;

        if (requestApproved)
        {
            var itApprover = await ResolveItApproverAsync(cancellationToken);
            recipients = [requester, itApprover, reviewer];
            eventType = "hod.approved";
            message = $"HOD validated all child access items for request #{accessRequest.AccessReqId}. The request is now pending IT review.";

            accessRequest.Status = RequestStatus.PendingIT;
            accessRequest.AggregateStatus = AggregateRequestStatus.Pending;
            accessRequest.ReqTo = itApprover.EmployeeId;
        }
        else
        {
            recipients = [requester, reviewer];
            eventType = "hod.rejected";
            message = $"HOD rejected request #{accessRequest.AccessReqId} after validating all child access items. The requester must resubmit the request.";

            accessRequest.Status = RequestStatus.RejectedHOD;
            accessRequest.AggregateStatus = AggregateRequestStatus.Rejected;
            accessRequest.ReqTo = requester.EmployeeId;
        }

        accessRequest.ModifiedBy = reviewer.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        foreach (var accessItem in accessItems)
        {
            var itemEventType = accessItem.HodValidationStatus == AggregateRequestStatus.Approved
                ? "hod.item.approved"
                : "hod.item.rejected";
            var itemMessage = accessItem.HodValidationStatus == AggregateRequestStatus.Approved
                ? $"HOD approved child item #{accessItem.AccessItemId} for folder '{accessItem.FolderPath}' with '{accessItem.ConfirmAccessType}'."
                : $"HOD rejected child item #{accessItem.AccessItemId} for folder '{accessItem.FolderPath}'. Comments: {accessItem.HodValidationComments}";

            await AddAuditEntriesAsync(
                accessRequest.AccessReqId,
                accessItem.AccessItemId,
                null,
                itemEventType,
                itemMessage,
                recipients,
                reviewer.EmployeeId.ToString(),
                utcNow,
                cancellationToken);
        }

        await AddAuditEntriesAsync(
            accessRequest.AccessReqId,
            null,
            null,
            eventType,
            message,
            recipients,
            reviewer.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);

        await PushNotificationsAsync(recipients, accessRequest.AccessReqId, eventType, message, utcNow, cancellationToken);

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, accessRequest.Status, accessRequest.AggregateStatus, message);
    }

    public async Task<ReviewAccessRequestResponse> ReviewByItAsync(int accessReqId, ReviewByItRequest request, CancellationToken cancellationToken)
    {
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (!request.Approved && string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when IT rejects a request.");
        }

        if (request.Approved && string.IsNullOrWhiteSpace(request.ItsrNo))
        {
            throw new AppValidationException("ITSR number is required when IT approves access.");
        }

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.ItTeam, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DepartmentId, cancellationToken);

        if (accessRequest.Status != RequestStatus.PendingIT)
        {
            throw new AppValidationException("Only requests pending IT review can be reviewed by IT.");
        }

        var utcNow = DateTime.UtcNow;
        var approvalStatus = request.Approved ? RequestStatus.ApprovedIT : RequestStatus.RejectedIT;

        dbContext.AccessApprovals.Add(new AccessApprovalEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            ApproverId = reviewer.EmployeeId,
            ApprovalStatus = approvalStatus,
            Comments = request.Comments?.Trim() ?? string.Empty,
            CreatedBy = reviewer.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = reviewer.EmployeeId.ToString(),
            ModifiedOn = utcNow
        });

        var recipients = new List<EmployeeEntity> { requester, reviewer };
        recipients.AddRange(hodRecipients);

        string eventType;
        string message;

        if (request.Approved)
        {
            eventType = "it.approved";
            message = $"IT approved access request #{accessRequest.AccessReqId} and granted access.";
            accessRequest.Status = RequestStatus.AccessGranted;
            accessRequest.AggregateStatus = AggregateRequestStatus.Approved;
            accessRequest.ItsrNo = request.ItsrNo!.Trim();
            accessRequest.ReqTo = requester.EmployeeId;

            var itemRows = await dbContext.AccessItems
                .Where(item => item.AccessReqId == accessRequest.AccessReqId)
                .ToListAsync(cancellationToken);

            foreach (var item in itemRows)
            {
                item.AccessGrantedOn = utcNow;
                item.AccessValidUntil = utcNow.AddDays(365);
                item.ModifiedBy = reviewer.EmployeeId.ToString();
                item.ModifiedOn = utcNow;
            }
        }
        else
        {
            eventType = "it.rejected";
            message = $"IT rejected access request #{accessRequest.AccessReqId}. HOD must resubmit the request. Comments: {request.Comments!.Trim()}";
            accessRequest.Status = RequestStatus.RejectedIT;
            accessRequest.AggregateStatus = AggregateRequestStatus.Rejected;
            accessRequest.ReqTo = hodRecipients.FirstOrDefault()?.EmployeeId ?? reviewer.EmployeeId;
        }

        accessRequest.ModifiedBy = reviewer.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        var distinctRecipients = recipients.DistinctBy(employee => employee.EmployeeId).ToArray();

        await AddAuditEntriesAsync(
            accessRequest.AccessReqId,
            null,
            null,
            eventType,
            message,
            distinctRecipients,
            reviewer.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(distinctRecipients, accessRequest.AccessReqId, eventType, message, utcNow, cancellationToken);

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, accessRequest.Status, accessRequest.AggregateStatus, message);
    }

    public async Task<ReviewAccessRequestResponse> RevokeAsync(int accessReqId, RevokeAccessRequest request, CancellationToken cancellationToken)
    {
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when revoking access.");
        }

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.ItTeam, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DepartmentId, cancellationToken);

        if (accessRequest.Status != RequestStatus.AccessGranted)
        {
            throw new AppValidationException("Only granted access requests can be revoked.");
        }

        var utcNow = DateTime.UtcNow;

        dbContext.AccessApprovals.Add(new AccessApprovalEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            ApproverId = reviewer.EmployeeId,
            ApprovalStatus = RequestStatus.Revoked,
            Comments = request.Comments.Trim(),
            CreatedBy = reviewer.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = reviewer.EmployeeId.ToString(),
            ModifiedOn = utcNow
        });

        accessRequest.Status = RequestStatus.Revoked;
        accessRequest.AggregateStatus = AggregateRequestStatus.Revoked;
        accessRequest.ReqTo = requester.EmployeeId;
        accessRequest.ModifiedBy = reviewer.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        var recipients = new List<EmployeeEntity> { requester, reviewer };
        recipients.AddRange(hodRecipients);
        var distinctRecipients = recipients.DistinctBy(employee => employee.EmployeeId).ToArray();
        var message = $"IT revoked access request #{accessRequest.AccessReqId}. Comments: {request.Comments.Trim()}";

        await AddAuditEntriesAsync(
            accessRequest.AccessReqId,
            null,
            null,
            "it.revoked",
            message,
            distinctRecipients,
            reviewer.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(distinctRecipients, accessRequest.AccessReqId, "it.revoked", message, utcNow, cancellationToken);

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, accessRequest.Status, accessRequest.AggregateStatus, message);
    }

    public async Task<RenewAccessRequestResponse> RenewAsync(int accessReqId, RenewAccessRequest request, CancellationToken cancellationToken)
    {
        if (request.RequestedByEmployeeId <= 0)
        {
            throw new AppValidationException("Requested by employee id must be greater than zero.");
        }

        var sourceRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(request.RequestedByEmployeeId, cancellationToken);

        if (sourceRequest.EmpId != requester.EmployeeId)
        {
            throw new AppValidationException("Only the original requester can renew an access request.");
        }

        if (sourceRequest.Status is not RequestStatus.AccessGranted and not RequestStatus.Expired and not RequestStatus.Revoked)
        {
            throw new AppValidationException("Only granted, expired, or revoked requests can be renewed.");
        }

        var hodApprover = await ResolveHodApproverAsync(requester.DepartmentId, null, cancellationToken);
        var sourceItems = await dbContext.AccessItems
            .AsNoTracking()
            .Where(item => item.AccessReqId == sourceRequest.AccessReqId)
            .OrderBy(item => item.AccessItemId)
            .ToListAsync(cancellationToken);

        if (sourceItems.Count == 0)
        {
            throw new AppValidationException("The source request does not contain any access items.");
        }

        var utcNow = DateTime.UtcNow;

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var renewalRequest = new AccessRequestEntity
        {
            EmpId = requester.EmployeeId,
            ReqTo = hodApprover.EmployeeId,
            ItsrNo = request.ItsrNo?.Trim() ?? string.Empty,
            IsAgreed = true,
            AggregateStatus = AggregateRequestStatus.Pending,
            Status = RequestStatus.PendingHOD,
            CreatedBy = requester.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = requester.EmployeeId.ToString(),
            ModifiedOn = utcNow
        };

        dbContext.AccessRequests.Add(renewalRequest);
        await dbContext.SaveChangesAsync(cancellationToken);

        var renewalItems = sourceItems.Select(item => new AccessItemEntity
        {
            AccessReqId = renewalRequest.AccessReqId,
            FolderPath = item.FolderPath,
            AccessType = item.AccessType,
            ConfirmAccessType = AccessTypes.NotApplicable,
            HodValidationStatus = AggregateRequestStatus.Pending,
            HodValidationComments = string.Empty,
            IsHodValidated = false,
            Reason = item.Reason,
            CreatedBy = requester.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = requester.EmployeeId.ToString(),
            ModifiedOn = utcNow
        }).ToArray();

        dbContext.AccessItems.AddRange(renewalItems);

        var recipients = new[] { requester, hodApprover };
        var message = $"Access request #{sourceRequest.AccessReqId} was renewed as request #{renewalRequest.AccessReqId}.";

        await AddAuditEntriesAsync(
            renewalRequest.AccessReqId,
            null,
            null,
            "request.renewed",
            message,
            recipients,
            requester.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await PushNotificationsAsync(recipients, renewalRequest.AccessReqId, "request.renewed", message, utcNow, cancellationToken);

        return new RenewAccessRequestResponse(renewalRequest.AccessReqId, renewalRequest.Status, renewalRequest.AggregateStatus, message);
    }

    public async Task<AccessRequestDetailsDto> GetDetailsAsync(int accessReqId, int viewerEmployeeId, CancellationToken cancellationToken)
    {
        var viewer = await GetEmployeeOrThrowAsync(viewerEmployeeId, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var currentApprover = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(employee => employee.EmployeeId == accessRequest.ReqTo, cancellationToken);

        EnsureCanView(viewer, requester, accessRequest);

        var itemRows = await dbContext.AccessItems
            .AsNoTracking()
            .Where(item => item.AccessReqId == accessRequest.AccessReqId)
            .OrderBy(item => item.AccessItemId)
            .ToListAsync(cancellationToken);

        var items = itemRows
            .Select(item => new AccessRequestItemDto(
                item.AccessItemId,
                item.FolderPath,
                item.AccessType,
                item.ConfirmAccessType,
                item.HodValidationStatus,
                item.HodValidationComments,
                item.IsHodValidated,
                item.AccessGrantedOn,
                item.AccessValidUntil,
                item.Reason,
                item.CreatedOn))
            .ToList();

        var approvalRows = await (
            from approval in dbContext.AccessApprovals.AsNoTracking()
            join employee in dbContext.Employees.AsNoTracking()
                on approval.ApproverId equals employee.EmployeeId
            where approval.AccessReqId == accessRequest.AccessReqId
            orderby approval.CreatedOn
            select new
            {
                approval.AccessApproveId,
                approval.ApproverId,
                employee.Name,
                employee.Role,
                approval.ApprovalStatus,
                approval.Comments,
                approval.CreatedOn
            }
        ).ToListAsync(cancellationToken);

        var approvals = approvalRows
            .Select(approval => new AccessRequestApprovalDto(
                approval.AccessApproveId,
                approval.ApproverId,
                approval.Name,
                approval.Role,
                approval.ApprovalStatus,
                approval.Comments,
                approval.CreatedOn))
            .ToList();

        var timelineRows = await dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(audit => audit.AccessReqId == accessRequest.AccessReqId)
            .OrderByDescending(audit => audit.CreatedOn)
            .ToListAsync(cancellationToken);

        var timeline = timelineRows
            .Select(audit => new AccessRequestTimelineDto(
                audit.AuditId,
                audit.EventType,
                audit.Message,
                audit.RecipientEmpId,
                audit.RecipientName,
                audit.RecipientRole,
                audit.IsRead,
                audit.CreatedOn))
            .ToList();

        return new AccessRequestDetailsDto(
            accessRequest.AccessReqId,
            accessRequest.EmpId,
            requester.Name,
            requester.DepartmentId,
            requester.DepartmentName,
            accessRequest.ReqTo,
            currentApprover?.Name ?? string.Empty,
            currentApprover?.Role ?? string.Empty,
            accessRequest.Status,
            accessRequest.AggregateStatus,
            accessRequest.ItsrNo,
            accessRequest.CreatedOn,
            accessRequest.ModifiedOn,
            items,
            approvals,
            timeline);
    }

    public async Task<IReadOnlyList<NotificationDto>> GetNotificationsAsync(int employeeId, CancellationToken cancellationToken)
    {
        _ = await GetEmployeeOrThrowAsync(employeeId, cancellationToken);

        var notificationRows = await dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(audit => audit.RecipientEmpId == employeeId)
            .OrderByDescending(audit => audit.CreatedOn)
            .Take(50)
            .ToListAsync(cancellationToken);

        return notificationRows
            .Select(audit => new NotificationDto(
                audit.AuditId,
                audit.AccessReqId,
                audit.EventType,
                audit.Message,
                audit.RecipientEmpId,
                audit.RecipientName,
                audit.RecipientRole,
                audit.IsRead,
                audit.CreatedOn))
            .ToList();
    }

    public async Task MarkNotificationReadAsync(int auditId, int employeeId, CancellationToken cancellationToken)
    {
        var audit = await dbContext.AccessReqAudits
            .FirstOrDefaultAsync(item => item.AuditId == auditId && item.RecipientEmpId == employeeId, cancellationToken);

        if (audit is null)
        {
            throw new AppValidationException("Notification was not found.");
        }

        audit.IsRead = true;
        audit.ModifiedBy = employeeId.ToString();
        audit.ModifiedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateCreateRequest(CreateAccessRequest request)
    {
        if (request.EmpId <= 0)
        {
            throw new AppValidationException("Employee id must be greater than zero.");
        }

        if (request.Items.Count == 0)
        {
            throw new AppValidationException("At least one access item is required.");
        }

        if (request.Items.Any(item => string.IsNullOrWhiteSpace(item.FolderPath) || string.IsNullOrWhiteSpace(item.Reason)))
        {
            throw new AppValidationException("Each access item requires a folder path and reason.");
        }

        if (request.Items.Any(item => !Enum.IsDefined(typeof(AccessTypes), item.AccessType)))
        {
            throw new AppValidationException("One or more access types are invalid.");
        }
    }

    private async Task<EmployeeEntity> GetEmployeeOrThrowAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .FirstOrDefaultAsync(employee => employee.EmployeeId == employeeId, cancellationToken)
            ?? throw new AppValidationException($"Employee {employeeId} was not found.");
    }

    private async Task<EmployeeEntity> EnsureRoleAsync(int employeeId, string role, CancellationToken cancellationToken)
    {
        var employee = await GetEmployeeOrThrowAsync(employeeId, cancellationToken);

        if (!string.Equals(employee.Role, role, StringComparison.OrdinalIgnoreCase))
        {
            throw new AppValidationException($"Employee {employeeId} is not authorized for this action.");
        }

        return employee;
    }

    private async Task<AccessRequestEntity> GetRequestOrThrowAsync(int accessReqId, CancellationToken cancellationToken)
    {
        return await dbContext.AccessRequests
            .FirstOrDefaultAsync(request => request.AccessReqId == accessReqId, cancellationToken)
            ?? throw new AppValidationException($"Access request {accessReqId} was not found.");
    }

    private async Task<EmployeeEntity> ResolveHodApproverAsync(int departmentId, int? requestedApproverId, CancellationToken cancellationToken)
    {
        var hods = await GetDepartmentHodsAsync(departmentId, cancellationToken);

        if (hods.Count == 0)
        {
            throw new AppValidationException("No HOD approver is configured for the requester department.");
        }

        if (requestedApproverId is null or <= 0)
        {
            return hods[0];
        }

        var requested = hods.FirstOrDefault(employee => employee.EmployeeId == requestedApproverId.Value);
        return requested ?? throw new AppValidationException("The requested approver is not a valid HOD for the requester department.");
    }

    private async Task<List<EmployeeEntity>> GetDepartmentHodsAsync(int departmentId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .Where(employee => employee.DepartmentId == departmentId && employee.Role == RoleNames.Hod)
            .OrderBy(employee => employee.EmployeeId)
            .ToListAsync(cancellationToken);
    }

    private async Task<EmployeeEntity> ResolveItApproverAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .Where(employee => employee.Role == RoleNames.ItTeam)
            .OrderBy(employee => employee.EmployeeId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new AppValidationException("No IT approver is configured.");
    }

    private static void EnsureCanView(EmployeeEntity viewer, EmployeeEntity requester, AccessRequestEntity accessRequest)
    {
        if (viewer.Role == RoleNames.ItTeam)
        {
            return;
        }

        if (viewer.Role == RoleNames.Hod && viewer.DepartmentId == requester.DepartmentId)
        {
            return;
        }

        if (viewer.EmployeeId == accessRequest.EmpId)
        {
            return;
        }

        throw new AppValidationException("You are not allowed to view this access request.");
    }

    private async Task AddAuditEntriesAsync(
        int accessReqId,
        int? accessItemId,
        int? accessApproveId,
        string eventType,
        string message,
        IReadOnlyCollection<EmployeeEntity> recipients,
        string actor,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        var entries = recipients
            .DistinctBy(employee => employee.EmployeeId)
            .Select(recipient => new AccessReqAuditEntity
            {
                AccessReqId = accessReqId,
                AccessItemId = accessItemId,
                AccessApproveId = accessApproveId,
                EventType = eventType,
                Message = message,
                RecipientEmpId = recipient.EmployeeId,
                RecipientName = recipient.Name,
                RecipientRole = recipient.Role,
                IsRead = false,
                CreatedBy = actor,
                CreatedOn = utcNow,
                ModifiedBy = actor,
                ModifiedOn = utcNow
            });

        await dbContext.AccessReqAudits.AddRangeAsync(entries, cancellationToken);
    }

    private async Task PushNotificationsAsync(
        IReadOnlyCollection<EmployeeEntity> recipients,
        int accessReqId,
        string eventType,
        string message,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        foreach (var recipient in recipients.DistinctBy(employee => employee.EmployeeId))
        {
            await hubContext.Clients
                .Group(NotificationHub.GroupName(recipient.EmployeeId))
                .SendAsync(
                    "notification",
                    new
                    {
                        accessReqId,
                        eventType,
                        message,
                        employeeId = recipient.EmployeeId,
                        createdOn = utcNow
                    },
                    cancellationToken);
        }
    }
}
