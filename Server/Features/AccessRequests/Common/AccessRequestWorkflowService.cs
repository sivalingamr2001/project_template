using System.Linq;
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
using Server.Features.AccessRequests.Resubmit;
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
        var hodApprover = await ResolveHodApproverAsync(requester.DeptId, request.ReqTo, cancellationToken);
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
        accessRequest.IsAgreed = request.IsAgree;
        accessRequest.ModifiedBy = requester.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        // 4. Map and Add New Items to the collection
        foreach (var item in request.Items)
        {
            accessRequest.AccessItems.Add(new AccessItemEntity
            {
                AccessReqId = accessRequest.AccessReqId, // This will be set correctly by EF for new or existing parent
                Status = RequestStatus.PendingHOD,
                FolderPath = item.FolderPath.Trim(),
                AccessType = (AccessTypes)item.AccessType,
                ConfirmAccessType = (AccessTypes)item.ConfirmAccessTypeByHOD,
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
        var message = $"{requester.UserName} {(isUpdate ? "updated" : "submitted")} access request #{accessRequest.AccessReqId}.";
        var recipients = new List<EmployeeEntity> { requester, hodApprover };

        await AddAuditEntriesAsync(accessRequest.AccessReqId, null, null, actionKey, message, recipients, requester.EmployeeId.ToString(), utcNow, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await PushNotificationsAsync(recipients, accessRequest.AccessReqId, actionKey, message, utcNow, cancellationToken);

        return new CreateAccessRequestResponse(
            accessRequest.AccessReqId,
            accessRequest.EmpId,
            accessRequest.ReqTo,
            accessRequest.IsAgreed,
            accessRequest.ItsrNo,
            RequestStatus.PendingHOD,
            accessRequest.AccessItems
                .OrderBy(item => item.AccessItemId)
                .Select(item => new CreateAccessItemResponse(
                    item.AccessItemId,
                    item.Status,
                    item.FolderPath,
                    item.AccessType,
                    item.ConfirmAccessType,
                    item.Reason))
                .ToList());
    }

    public async Task<ReviewAccessRequestResponse> ReviewByHodAsync(int accessReqId, int accessItemId, ReviewByHodRequest request, CancellationToken cancellationToken)
    {
        // 1. Basic Validations
        if (request.ReviewerEmployeeId <= 0)
            throw new AppValidationException("Reviewer employee id must be greater than zero.");

        if (!request.Approved && string.IsNullOrWhiteSpace(request.Comments))
            throw new AppValidationException("Comments are required when HOD rejects an item.");

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.Hod, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);

        // 2. Fetch the specific single item
        var accessItem = await dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessReqId == accessReqId && x.AccessItemId == accessItemId, cancellationToken);

        if (accessItem == null)
            throw new AppValidationException($"Access Item ID {accessItemId} not found for this request.");

        var utcNow = DateTime.UtcNow;
        var actionStatus = request.Approved ? RequestStatus.ApprovedHOD : RequestStatus.RejectedHOD;

        // 3. Update the single item
        accessItem.Status = request.Approved ? RequestStatus.PendingIT : RequestStatus.RejectedHOD;
        accessItem.ConfirmAccessType = request.Approved ? request.ConfirmAccessType : accessItem.ConfirmAccessType;
        accessItem.ModifiedBy = reviewer.EmployeeId.ToString();
        accessItem.ModifiedOn = utcNow;

        // 4. Record the Approval/Rejection action for this specific item
        dbContext.AccessApprovals.Add(new AccessApprovalEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            AccessItemId = accessItemId,
            ApproverId = reviewer.EmployeeId,
            ApprovalStatus = actionStatus,
            Comments = request.Comments?.Trim() ?? string.Empty,
            CreatedBy = reviewer.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = reviewer.EmployeeId.ToString(),
            ModifiedOn = utcNow
        });

        // 5. Notifications
        string eventType = request.Approved ? "hod.item_approved" : "hod.item_rejected";
        string message = request.Approved
            ? $"HOD approved item {accessItemId} in request #{accessReqId}."
            : $"HOD rejected item {accessItemId} in request #{accessReqId}.";

        var itApprover = await ResolveItApproverAsync(cancellationToken);
        var recipients = new List<EmployeeEntity> { requester, reviewer };
        if (request.Approved)
        {
            recipients.Add(itApprover);
        }

        // 6. Persistence
        await AddAuditEntriesAsync(accessReqId, accessItemId, null, eventType, message, recipients, reviewer.EmployeeId.ToString(), utcNow, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(recipients, accessReqId, eventType, message, utcNow, cancellationToken);

        return new ReviewAccessRequestResponse(accessReqId, actionStatus, message);
    }

    public async Task<ReviewAccessRequestResponse> ReviewByItAsync(int accessReqId, int accessItemId, ReviewByItRequest request, CancellationToken cancellationToken)
    {
        // 1. Validation
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

        // 2. Fetch dependencies
        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.Admin, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);

        // 3. Load items and find the specific target
        var accessItems = await dbContext.AccessItems
            .Where(x => x.AccessReqId == accessReqId)
            .ToListAsync(cancellationToken);

        var currentAccessItem = accessItems.FirstOrDefault(x => x.AccessItemId == accessItemId);

        if (currentAccessItem == null)
        {
            throw new AppValidationException("The specified access item does not exist for this request.");
        }

        // 4. Validate item-specific status
        if (currentAccessItem.Status != RequestStatus.PendingIT)
        {
            throw new AppValidationException("Only items pending IT review can be reviewed.");
        }

        var utcNow = DateTime.UtcNow;
        var approvalStatus = request.Approved ? RequestStatus.ApprovedIT : RequestStatus.RejectedIT;

        // 5. Update ONLY the single selected item
        currentAccessItem.Status = request.Approved ? RequestStatus.AccessGranted : RequestStatus.RejectedIT;
        currentAccessItem.ModifiedBy = reviewer.EmployeeId.ToString();
        currentAccessItem.ModifiedOn = utcNow;

        // 6. Record approval history
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
            // Note: If your entity has an AccessItemId field, assign it here
        });

        // 7. Update Request Header
        if (request.Approved)
        {
            accessRequest.ItsrNo = request.ItsrNo!.Trim();
        }

        accessRequest.ReqTo = requester.EmployeeId;
        accessRequest.ModifiedBy = reviewer.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        // 8. Setup Messaging
        string eventType = request.Approved ? "it.approved" : "it.rejected";
        string message = request.Approved
            ? $"IT approved access for item #{accessItemId} in request #{accessRequest.AccessReqId}."
            : $"IT rejected access for item #{accessItemId}. Comments: {request.Comments!.Trim()}";

        // 9. Audit and Notifications
        var recipients = new List<EmployeeEntity> { requester, reviewer };
        recipients.AddRange(hodRecipients);
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

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, currentAccessItem.Status, message);
    }

    public async Task<ReviewAccessRequestResponse> RevokeAsync(int accessReqId, int accessItemId, RevokeAccessRequest request, CancellationToken cancellationToken)
    {
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when revoking access.");
        }

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.Admin, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);

        var accessItems = await dbContext.AccessItems
            .Where(x => x.AccessReqId == accessReqId)
            .ToListAsync(cancellationToken);

        // 1. Identify the specific item to revoke
        var currentAccessItem = accessItems.FirstOrDefault(x => x.AccessItemId == accessItemId);

        if (currentAccessItem == null)
        {
            throw new AppValidationException("Access item detail not found for this request.");
        }

        // 2. Fix CS1503: Pass a collection to DeriveRequestStatus
        var currentStatus = DeriveRequestStatus(new[] { currentAccessItem.Status });

        if (currentStatus != RequestStatus.AccessGranted)
        {
            throw new AppValidationException("Only granted access items can be revoked.");
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
            // Recommended: Add AccessItemId to your history entity if supported
        });

        // 3. Update ONLY the selected item
        currentAccessItem.Status = RequestStatus.Revoked;
        currentAccessItem.ModifiedBy = reviewer.EmployeeId.ToString();
        currentAccessItem.ModifiedOn = utcNow;

        var recipients = new List<EmployeeEntity> { requester, reviewer };
        recipients.AddRange(hodRecipients);
        var distinctRecipients = recipients.DistinctBy(employee => employee.EmployeeId).ToArray();

        // Updated message to specify which item was revoked
        var message = $"IT revoked access for item #{accessItemId} in request #{accessRequest.AccessReqId}. Comments: {request.Comments.Trim()}";

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

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, RequestStatus.Revoked, message);
    }

    public async Task<ResubmitAccessItemResponse> ResubmitAsync(int accessReqId, int accessItemId, ResubmitAccessItemRequest request, CancellationToken cancellationToken)
    {
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when resubmitting an access item.");
        }

        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);

        if (accessRequest.EmpId != request.ReviewerEmployeeId)
        {
            throw new AppValidationException("Only the original requester can resubmit this access item.");
        }

        var accessItem = await dbContext.AccessItems
            .FirstOrDefaultAsync(item => item.AccessReqId == accessReqId && item.AccessItemId == accessItemId, cancellationToken);

        if (accessItem == null)
        {
            throw new AppValidationException("Access item not found for this request.");
        }

        if (accessItem.Status is not RequestStatus.RejectedHOD and not RequestStatus.RejectedIT and not RequestStatus.Revoked)
        {
            throw new AppValidationException("Only rejected or revoked access items can be resubmitted.");
        }

        var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);
        var utcNow = DateTime.UtcNow;

        accessItem.Status = RequestStatus.PendingHOD;
        accessItem.ModifiedBy = requester.EmployeeId.ToString();
        accessItem.ModifiedOn = utcNow;

        var recipients = new List<EmployeeEntity> { requester };
        recipients.AddRange(hodRecipients);
        var distinctRecipients = recipients.DistinctBy(employee => employee.EmployeeId).ToArray();
        var message = $"Access item #{accessItemId} in request #{accessReqId} was resubmitted.";

        await AddAuditEntriesAsync(
            accessReqId,
            accessItemId,
            null,
            "request.resubmitted",
            message,
            distinctRecipients,
            requester.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(distinctRecipients, accessReqId, "request.resubmitted", message, utcNow, cancellationToken);

        return new ResubmitAccessItemResponse(accessReqId, accessItemId, accessItem.Status, message);
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

        var sourceItems = await dbContext.AccessItems
            .AsNoTracking()
            .Where(item => item.AccessReqId == sourceRequest.AccessReqId)
            .OrderBy(item => item.AccessItemId)
            .ToListAsync(cancellationToken);

        if (!sourceItems.Any())
        {
            throw new AppValidationException("The source request does not contain any access items.");
        }

        var sourceStatus = DeriveRequestStatus(sourceItems.Select(item => item.Status));
        if (sourceStatus is not RequestStatus.AccessGranted and not RequestStatus.Expired and not RequestStatus.Revoked)
        {
            throw new AppValidationException("Only granted, expired, or revoked requests can be renewed.");
        }

        var hodApprover = await ResolveHodApproverAsync(requester.DeptId, null, cancellationToken);

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
            Status = RequestStatus.PendingHOD,
            FolderPath = item.FolderPath,
            AccessType = item.AccessType,
            Reason = item.Reason,
            CreatedBy = requester.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = requester.EmployeeId.ToString(),
            ModifiedOn = utcNow
        }).ToArray();

        dbContext.AccessItems.AddRange(renewalItems);

        var recipients = new List<EmployeeEntity> { requester, hodApprover };
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

        return new RenewAccessRequestResponse(renewalRequest.AccessReqId, RequestStatus.PendingHOD, message);
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
                item.Status,
                item.FolderPath,
                item.AccessType,
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
                employee.UserName,
                employee.UserRole,
                approval.ApprovalStatus,
                approval.Comments,
                approval.CreatedOn
            }
        ).ToListAsync(cancellationToken);

        var approvals = approvalRows
            .Select(approval => new AccessRequestApprovalDto(
                approval.AccessApproveId,
                approval.ApproverId,
                approval.UserName,
                string.IsNullOrWhiteSpace(approval.UserRole) ? "User" : approval.UserRole!,
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
            requester.UserName,
            requester.DeptId ?? 0,
            string.IsNullOrWhiteSpace(requester.DeptName) ? "N/A" : requester.DeptName!,
            accessRequest.ReqTo,
            currentApprover?.UserName ?? string.Empty,
            string.IsNullOrWhiteSpace(currentApprover?.UserRole) ? "User" : currentApprover!.UserRole!,
            accessRequest.ItsrNo,
            accessRequest.CreatedOn,
            accessRequest.ModifiedOn,
            items,
            approvals,
            timeline);
    }

    public async Task<Server.Shared.Helpers.PaginatedResponse<NotificationDto>> GetNotificationsAsync(
        int employeeId,
        GetNotificationsQuery query,
        CancellationToken cancellationToken)
    {
        _ = await GetEmployeeOrThrowAsync(employeeId, cancellationToken);

        var baseQuery = dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(audit => audit.RecipientEmpId == employeeId)
            .OrderByDescending(audit => audit.CreatedOn);

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var notificationRows = await baseQuery
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        var data = notificationRows
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

        return new Server.Shared.Helpers.PaginatedResponse<NotificationDto>(
            data,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
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

        if (!request.IsAgree)
        {
            throw new AppValidationException("You must agree before submitting the access request.");
        }

        if (request.Items.Any(item => !Enum.IsDefined(typeof(AccessTypes), item.ConfirmAccessTypeByHOD)))
        {
            throw new AppValidationException("One or more HOD confirmed access types are invalid.");
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

        if (!string.Equals(employee.UserRole, role, StringComparison.OrdinalIgnoreCase))
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

    private async Task<EmployeeEntity> ResolveHodApproverAsync(int? deptId, int? requestedApproverId, CancellationToken cancellationToken)
    {
        if (deptId is null or <= 0)
        {
            throw new AppValidationException("No department is configured for the requester.");
        }

        var hods = await GetDepartmentHodsAsync(deptId, cancellationToken);

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

    private async Task<List<EmployeeEntity>> GetDepartmentHodsAsync(int? deptId, CancellationToken cancellationToken)
    {
        if (deptId is null or <= 0)
        {
            return new List<EmployeeEntity>();
        }

        return await dbContext.Employees
            .Where(employee => employee.DeptId == deptId && employee.UserRole == RoleNames.Hod)
            .OrderBy(employee => employee.EmployeeId)
            .ToListAsync(cancellationToken);
    }

    private async Task<EmployeeEntity> ResolveItApproverAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .Where(employee => employee.UserRole == RoleNames.Admin)
            .OrderBy(employee => employee.EmployeeId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new AppValidationException("No IT approver is configured.");
    }

    private static void EnsureCanView(EmployeeEntity viewer, EmployeeEntity requester, AccessRequestEntity accessRequest)
    {
        if (viewer.UserRole == RoleNames.Admin)
        {
            return;
        }

        if (viewer.UserRole == RoleNames.Hod && viewer.DeptId == requester.DeptId)
        {
            return;
        }

        if (viewer.EmployeeId == accessRequest.EmpId)
        {
            return;
        }

        throw new AppValidationException("You are not allowed to view this access request.");
    }

    private static RequestStatus DeriveRequestStatus(IEnumerable<RequestStatus> statuses)
    {
        if (statuses.Any(status => status == RequestStatus.PendingHOD))
        {
            return RequestStatus.PendingHOD;
        }

        if (statuses.Any(status => status == RequestStatus.PendingIT))
        {
            return RequestStatus.PendingIT;
        }

        if (statuses.Any(status => status == RequestStatus.AccessGranted))
        {
            return RequestStatus.AccessGranted;
        }

        if (statuses.Any(status => status == RequestStatus.RejectedHOD))
        {
            return RequestStatus.RejectedHOD;
        }

        if (statuses.Any(status => status == RequestStatus.RejectedIT))
        {
            return RequestStatus.RejectedIT;
        }

        if (statuses.Any(status => status == RequestStatus.Revoked))
        {
            return RequestStatus.Revoked;
        }

        if (statuses.Any(status => status == RequestStatus.Expired))
        {
            return RequestStatus.Expired;
        }

        if (statuses.Any(status => status == RequestStatus.ApprovedHOD))
        {
            return RequestStatus.ApprovedHOD;
        }

        if (statuses.Any(status => status == RequestStatus.ApprovedIT))
        {
            return RequestStatus.ApprovedIT;
        }

        return RequestStatus.Submitted;
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
                RecipientName = recipient.UserName,
                RecipientRole = string.IsNullOrWhiteSpace(recipient.UserRole) ? "User" : recipient.UserRole!,
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
