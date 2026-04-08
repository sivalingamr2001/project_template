using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Server.Common.Realtime;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetDetails;
using Server.Features.AccessRequests.ReviewByHod;
using Server.Features.AccessRequests.ReviewByIt;
using Server.Features.AccessRequests.Revoke;
using Server.Features.AccessRequests.Renew;
using Server.Features.Notifications.GetList;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Exceptions;

namespace Server.Features.AccessRequests.Common;

public sealed class AccessRequestWorkflowService(
    AppDbContext dbContext,
    IHubContext<NotificationHub> hubContext)
{
    public async Task<CreateAccessRequestResponse> CreateAsync(CreateAccessRequest request, CancellationToken cancellationToken)
    {
        ValidateCreateRequest(request);

        var requester = await GetEmployeeOrThrowAsync(request.EmpId, cancellationToken);
        var hodApprover = await ResolveHodApproverAsync(requester.DepartmentId, request.ReqTo, cancellationToken);
        var utcNow = DateTime.UtcNow;

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var accessRequest = new AccessRequestEntity
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

        dbContext.AccessRequests.Add(accessRequest);
        await dbContext.SaveChangesAsync(cancellationToken);

        var items = request.Items.Select(item => new AccessItemEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            FolderPath = item.FolderPath.Trim(),
            AccessType = (AccessTypes)item.AccessType,
            Reason = item.Reason.Trim(),
            CreatedBy = requester.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = requester.EmployeeId.ToString(),
            ModifiedOn = utcNow
        }).ToArray();

        dbContext.AccessItems.AddRange(items);

        var recipients = new[] { requester, hodApprover };
        var message = $"{requester.Name} submitted access request #{accessRequest.AccessReqId} to HOD approval.";

        await AddAuditEntriesAsync(
            accessRequest.AccessReqId,
            null,
            null,
            "request.submitted",
            message,
            recipients,
            requester.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await PushNotificationsAsync(recipients, accessRequest.AccessReqId, "request.submitted", message, utcNow, cancellationToken);

        return new CreateAccessRequestResponse(accessRequest.AccessReqId, accessRequest.Status.ToString());
    }

    public async Task<ReviewAccessRequestResponse> ReviewByHodAsync(int accessReqId, ReviewByHodRequest request, CancellationToken cancellationToken)
    {
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (!request.Approved && string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when HOD rejects a request.");
        }

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, RoleNames.Hod, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);

        if (requester.DepartmentId != reviewer.DepartmentId)
        {
            throw new AppValidationException("HOD can review only requests from the same department.");
        }

        if (accessRequest.Status != RequestStatus.PendingHOD)
        {
            throw new AppValidationException("Only requests pending HOD approval can be reviewed by HOD.");
        }

        var utcNow = DateTime.UtcNow;
        var status = request.Approved ? RequestStatus.ApprovedHOD : RequestStatus.RejectedHOD;

        dbContext.AccessApprovals.Add(new AccessApprovalEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            ApproverId = reviewer.EmployeeId,
            ApprovalStatus = status,
            Comments = request.Comments?.Trim() ?? string.Empty,
            CreatedBy = reviewer.EmployeeId.ToString(),
            CreatedOn = utcNow,
            ModifiedBy = reviewer.EmployeeId.ToString(),
            ModifiedOn = utcNow
        });

        EmployeeEntity[] recipients;
        string eventType;
        string message;

        if (request.Approved)
        {
            var itApprover = await ResolveItApproverAsync(cancellationToken);
            recipients = [requester, itApprover, reviewer];
            eventType = "hod.approved";
            message = $"HOD approved access request #{accessRequest.AccessReqId}. It is now pending IT Infra review.";
            accessRequest.Status = RequestStatus.PendingIT;
            accessRequest.AggregateStatus = AggregateRequestStatus.Pending;
            accessRequest.ReqTo = itApprover.EmployeeId;
        }
        else
        {
            recipients = [requester, reviewer];
            eventType = "hod.rejected";
            message = $"HOD rejected access request #{accessRequest.AccessReqId}. Comments: {request.Comments!.Trim()}";
            accessRequest.Status = RequestStatus.RejectedHOD;
            accessRequest.AggregateStatus = AggregateRequestStatus.Rejected;
            accessRequest.ReqTo = requester.EmployeeId;
        }

        accessRequest.ModifiedBy = reviewer.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

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
        }
        else
        {
            eventType = "it.rejected";
            message = $"IT rejected access request #{accessRequest.AccessReqId}. Comments: {request.Comments!.Trim()}";
            accessRequest.Status = RequestStatus.RejectedIT;
            accessRequest.AggregateStatus = AggregateRequestStatus.Rejected;
            accessRequest.ReqTo = requester.EmployeeId;
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
