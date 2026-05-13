using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MySqlConnector;
using Server.Common.Realtime;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetDetails;
using Server.Features.AccessRequests.Renew;
using Server.Features.AccessRequests.Resubmit;
using Server.Features.AccessRequests.ReviewByHod;
using Server.Features.AccessRequests.ReviewByIt;
using Server.Features.AccessRequests.Revoke;
using Server.Features.Notifications.GetList;
using Server.Infrastructure.Db;
using Server.Shared.Exceptions;

namespace Server.Features.AccessRequests.Common;

public sealed class AccessRequestWorkflowService(
    AppDbContext dbContext,
    IHubContext<NotificationHub> hubContext,
    IAccessRequestEmailNotificationService emailNotificationService,
    IAccessRequestExpirationService expirationService)
{
    private const int AccessExpirationDays = 90;
    private const int ExpirationReminderDays = 7;

    public async Task<CreateAccessRequestResponse> CreateOrUpdateAsync(CreateAccessRequest request, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
        ValidateCreateRequest(request);

        var requester = await GetEmployeeOrThrowAsync(request.EmpId, cancellationToken);
        var hodApprover = await ResolveHodApproverAsync(requester.DeptId, request.ReqTo, cancellationToken);
        var folderHodRecipients = await GetFolderHodRecipientsAsync(request.Items.Select(item => item.FolderPath), cancellationToken);
        var itRecipients = await GetItApproversAsync(cancellationToken);
        var utcNow = DateTime.UtcNow;

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        AccessRequestEntity accessRequest;
        bool isUpdate = request.AccessReqId > 0;

        if (isUpdate)
        {
            // 1. Fetch parent including existing items
            accessRequest = await dbContext.AccessRequests
                .Include(x => x.AccessItems)
                .FirstOrDefaultAsync(x => x.AccessReqId == request.AccessReqId, cancellationToken)
                ?? throw new Exception($"Request {request.AccessReqId} not found.");

            // 2. WORLD-CLASS OPTIMIZATION FOR UPDATES:
            // Update statuses on existing items instead of dropping and regenerating tracking keys
            foreach (var existingItem in accessRequest.AccessItems)
            {
                existingItem.Status = RequestStatus.PendingHOD; // Or your specific target workflow enum state
                existingItem.ModifiedBy = requester.EmployeeId.ToString();
                existingItem.ModifiedOn = utcNow;
            }
        }
        else
        {
            // Initialize an empty container profile for pristine target creation
            accessRequest = new AccessRequestEntity
            {
                CreatedBy = requester.EmployeeId.ToString(),
                CreatedOn = utcNow,
                AccessItems = new List<AccessItemEntity>()
            };
            dbContext.AccessRequests.Add(accessRequest);
        }

        // 3. Sync Parent State Parameters
        accessRequest.EmpId = requester.EmployeeId;
        accessRequest.ReqTo = hodApprover.EmployeeId;
        accessRequest.ItsrNo = request.ItsrNo?.Trim() ?? string.Empty;
        accessRequest.IsAgreed = request.IsAgree;
        accessRequest.ModifiedBy = requester.EmployeeId.ToString();
        accessRequest.ModifiedOn = utcNow;

        // 4. Handle child folder item mapping
        if (!isUpdate)
        {
            // EXCLUSIVE ENTRY GATE: Allocate seed token FROM database ONLY during brand-new submission requests
            var connection = dbContext.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync(cancellationToken);
            }

            string baseTicketNumber;
            using (var command = connection.CreateCommand())
            {
                // Lock the active transaction scope immediately so concurrent submissions are queued
                command.Transaction = dbContext.Database.CurrentTransaction?.GetDbTransaction();
                command.CommandText = "GetNextTicketNumber";
                command.CommandType = System.Data.CommandType.StoredProcedure;

                var outParam = new MySqlParameter
                {
                    ParameterName = "out_ticket_number",
                    MySqlDbType = MySqlDbType.VarChar,
                    Size = 50,
                    Direction = System.Data.ParameterDirection.Output
                };
                command.Parameters.Add(outParam);

                await command.ExecuteNonQueryAsync(cancellationToken);
                baseTicketNumber = outParam.Value?.ToString()
                    ?? throw new Exception("Database sequence generation engine returned empty result.");
            }

            // Deconstruct the structured string cleanly: "NAS-REQ-20260513-001"
            int dashIndex = baseTicketNumber.LastIndexOf('-');
            string prefixPart = baseTicketNumber.Substring(0, dashIndex + 1); // Yields: "NAS-REQ-20260513-"
            string sequencePart = baseTicketNumber.Substring(dashIndex + 1);  // Yields: "001"
            int currentSequence = int.Parse(sequencePart);

            // Process item iterations entirely in-memory using our sequence baseline
            foreach (var item in request.Items)
            {
                string generatedTicketNumber = $"{prefixPart}{currentSequence:D3}";
                currentSequence++; // Increment sequence internally for subsequent items

                accessRequest.AccessItems.Add(new AccessItemEntity
                {
                    AccessReqId = accessRequest.AccessReqId,
                    TicketNumber = generatedTicketNumber,
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
        }

        // 5. Commit all entity graph modifications to the database in a single round-trip call
        await dbContext.SaveChangesAsync(cancellationToken);

        // 6. Audit Logging Execution Block
        var actionKey = isUpdate ? "request.updated" : "request.submitted";
        var message = $"{requester.UserName} {(isUpdate ? "updated" : "submitted")} access request #{accessRequest.AccessReqId}.";
        var hodRecipients = new[] { hodApprover }.Concat(folderHodRecipients).DistinctBy(employee => employee.EmployeeId);
        var recipients = BuildStageRecipients(requester, hodRecipients, itRecipients);

        await AddAuditEntriesAsync(accessRequest.AccessReqId, null, null, actionKey, message, recipients, requester.EmployeeId.ToString(), utcNow, cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        // 7. Background Messaging Notifications Routing Dispatcher Pipeline
        await PushNotificationsAsync(recipients, accessRequest.AccessReqId, actionKey, message, utcNow, cancellationToken);
        await SendStageEmailAsync(
            actionKey,
            isUpdate ? $"Access Request #{accessRequest.AccessReqId} Updated" : $"Access Request #{accessRequest.AccessReqId} Submitted",
            isUpdate
                ? $"Access request #{accessRequest.AccessReqId} has been updated and is awaiting review."
                : $"Access request #{accessRequest.AccessReqId} has been submitted and is awaiting review.",
            accessRequest,
            requester,
            recipients,
            null,
            null,
            null,
            cancellationToken);

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
                    item.TicketNumber,
                    item.Status,
                    item.FolderPath,
                    item.AccessType,
                    item.ConfirmAccessType,
                    item.Reason))
                .ToList());
    }

    public async Task<ReviewAccessRequestResponse> ReviewByHodAsync(int accessReqId, int accessItemId, ReviewByHodRequest request, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
        // 1. Basic Validations
        if (request.ReviewerEmployeeId <= 0)
            throw new AppValidationException("Reviewer employee id must be greater than zero.");

        if (!request.Approved && string.IsNullOrWhiteSpace(request.Comments))
            throw new AppValidationException("Comments are required when HOD rejects an item.");

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, UserRole.Hod, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);
        var itRecipients = await GetItApproversAsync(cancellationToken);

        // 2. Fetch the specific single item
        var accessItem = await dbContext.AccessItems
            .FirstOrDefaultAsync(x => x.AccessReqId == accessReqId && x.AccessItemId == accessItemId, cancellationToken);

        var folderHodRecipients = accessItem is null ? new List<EmployeeEntity>() : await GetFolderHodRecipientsAsync(new[] { accessItem.FolderPath }, cancellationToken);

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

        var recipients = BuildStageRecipients(requester, hodRecipients.Append(reviewer).Concat(folderHodRecipients), itRecipients);

        if (request.Approved)
        {
            accessRequest.ReqTo = itRecipients.First().EmployeeId;
        }

        // 6. Persistence
        await AddAuditEntriesAsync(accessReqId, accessItemId, null, eventType, message, recipients, reviewer.EmployeeId.ToString(), utcNow, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(recipients, accessReqId, eventType, message, utcNow, cancellationToken);
        await SendStageEmailAsync(
            eventType,
            request.Approved
                ? $"Access Request #{accessReqId} - HOD Approved Item #{accessItemId}"
                : $"Access Request #{accessReqId} - HOD Rejected Item #{accessItemId}",
            message,
            accessRequest,
            requester,
            recipients,
            accessItem,
            request.Comments,
            null,
            cancellationToken);

        return new ReviewAccessRequestResponse(accessReqId, actionStatus, message);
    }

    public async Task<ReviewAccessRequestResponse> ReviewByItAsync(int accessReqId, int accessItemId, ReviewByItRequest request, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
        // 1. Validation
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (!request.Approved && string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when IT rejects a request.");
        }

        // 2. Fetch dependencies
        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, UserRole.Admin, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);
        var itRecipients = await GetItApproversAsync(cancellationToken);

        // 3. Load items and find the specific target
        var accessItems = await dbContext.AccessItems
            .Where(x => x.AccessReqId == accessReqId)
            .ToListAsync(cancellationToken);

        var currentAccessItem = accessItems.FirstOrDefault(x => x.AccessItemId == accessItemId);
        var folderHodRecipients = currentAccessItem is null ? new List<EmployeeEntity>() : await GetFolderHodRecipientsAsync(new[] { currentAccessItem.FolderPath }, cancellationToken);

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
            AccessItemId = accessItemId,
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
        if (!string.IsNullOrWhiteSpace(request.ItsrNo))
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
        var distinctRecipients = BuildStageRecipients(requester, hodRecipients.Concat(folderHodRecipients), itRecipients.Append(reviewer));

        await AddAuditEntriesAsync(
            accessRequest.AccessReqId,
            accessItemId,
            null,
            eventType,
            message,
            distinctRecipients,
            reviewer.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(distinctRecipients, accessRequest.AccessReqId, eventType, message, utcNow, cancellationToken);
        await SendStageEmailAsync(
            eventType,
            request.Approved
                ? $"Access Request #{accessReqId} - IT Approved Item #{accessItemId}"
                : $"Access Request #{accessReqId} - IT Rejected Item #{accessItemId}",
            message,
            accessRequest,
            requester,
            distinctRecipients,
            currentAccessItem,
            request.Comments,
            request.Approved ? GetExpirationDateUtc(utcNow) : null,
            cancellationToken);

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, currentAccessItem.Status, message);
    }

    public async Task<ReviewAccessRequestResponse> RevokeAsync(int accessReqId, int accessItemId, RevokeAccessRequest request, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
        if (request.ReviewerEmployeeId <= 0)
        {
            throw new AppValidationException("Reviewer employee id must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.Comments))
        {
            throw new AppValidationException("Comments are required when revoking access.");
        }

        var reviewer = await EnsureRoleAsync(request.ReviewerEmployeeId, UserRole.Admin, cancellationToken);
        var accessRequest = await GetRequestOrThrowAsync(accessReqId, cancellationToken);
        var requester = await GetEmployeeOrThrowAsync(accessRequest.EmpId, cancellationToken);
        var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);
        var itRecipients = await GetItApproversAsync(cancellationToken);

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
            AccessItemId = accessItemId,
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

        var distinctRecipients = BuildStageRecipients(requester, hodRecipients, itRecipients.Append(reviewer));

        // Updated message to specify which item was revoked
        var message = $"IT revoked access for item #{accessItemId} in request #{accessRequest.AccessReqId}. Comments: {request.Comments.Trim()}";

        await AddAuditEntriesAsync(
            accessRequest.AccessReqId,
            accessItemId,
            null,
            "it.revoked",
            message,
            distinctRecipients,
            reviewer.EmployeeId.ToString(),
            utcNow,
            cancellationToken);

        await dbContext.SaveChangesAsync(cancellationToken);
        await PushNotificationsAsync(distinctRecipients, accessRequest.AccessReqId, "it.revoked", message, utcNow, cancellationToken);
        await SendStageEmailAsync(
            "it.revoked",
            $"Access Request #{accessReqId} - Access Revoked for Item #{accessItemId}",
            message,
            accessRequest,
            requester,
            distinctRecipients,
            currentAccessItem,
            request.Comments,
            null,
            cancellationToken);

        return new ReviewAccessRequestResponse(accessRequest.AccessReqId, RequestStatus.Revoked, message);
    }

    public async Task<ResubmitAccessItemResponse> ResubmitAsync(int accessReqId, int accessItemId, ResubmitAccessItemRequest request, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
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
        var itRecipients = await GetItApproversAsync(cancellationToken);
        var utcNow = DateTime.UtcNow;

        accessItem.Status = RequestStatus.PendingHOD;
        accessItem.ModifiedBy = requester.EmployeeId.ToString();
        accessItem.ModifiedOn = utcNow;

        var distinctRecipients = BuildStageRecipients(requester, hodRecipients, itRecipients);
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
        await SendStageEmailAsync(
            "request.resubmitted",
            $"Access Request #{accessReqId} - Item #{accessItemId} Resubmitted",
            message,
            accessRequest,
            requester,
            distinctRecipients,
            accessItem,
            request.Comments,
            null,
            cancellationToken);

        return new ResubmitAccessItemResponse(accessReqId, accessItemId, accessItem.Status, message);
    }

    public async Task<RenewAccessRequestResponse> RenewAsync(int accessReqId, RenewAccessRequest request, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
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
        var itRecipients = await GetItApproversAsync(cancellationToken);

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

        var recipients = BuildStageRecipients(requester, new[] { hodApprover }, itRecipients);
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
        await SendStageEmailAsync(
            "request.renewed",
            $"Access Request #{renewalRequest.AccessReqId} Created from Renewal",
            message,
            renewalRequest,
            requester,
            recipients,
            null,
            null,
            null,
            cancellationToken);

        return new RenewAccessRequestResponse(renewalRequest.AccessReqId, RequestStatus.PendingHOD, message);
    }

    public async Task<AccessRequestDetailsDto> GetDetailsAsync(int accessReqId, int viewerEmployeeId, CancellationToken cancellationToken)
    {
        await SyncExpirationsAsync(cancellationToken);
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
                approval.UserRole.ToString(),
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
            requester.Department?.DepartmentName ?? string.Empty,
            accessRequest.ReqTo,
            currentApprover?.UserName ?? string.Empty,
            currentApprover?.UserRole.ToString() ?? "User",
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
        await SyncExpirationsAsync(cancellationToken);
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

    public async Task SyncExpirationsAsync(CancellationToken cancellationToken)
    {
        var utcNow = DateTime.UtcNow;
        var grantedItems = await dbContext.AccessItems
            .Where(item => item.Status == RequestStatus.AccessGranted)
            .OrderBy(item => item.AccessItemId)
            .ToListAsync(cancellationToken);

        if (grantedItems.Count == 0)
        {
            return;
        }

        var itemIds = grantedItems.Select(item => item.AccessItemId).ToArray();
        var requestIds = grantedItems.Select(item => item.AccessReqId).Distinct().ToArray();

        var approvals = await dbContext.AccessApprovals
            .AsNoTracking()
            .Where(approval => itemIds.Contains(approval.AccessItemId) && approval.ApprovalStatus == RequestStatus.ApprovedIT)
            .ToListAsync(cancellationToken);

        if (approvals.Count == 0)
        {
            return;
        }

        var approvalByItemId = approvals
            .GroupBy(approval => approval.AccessItemId)
            .ToDictionary(
                grouping => grouping.Key,
                grouping => grouping
                    .OrderByDescending(approval => approval.ModifiedOn ?? approval.CreatedOn)
                    .First());

        var requests = await dbContext.AccessRequests
            .Where(request => requestIds.Contains(request.AccessReqId))
            .ToDictionaryAsync(request => request.AccessReqId, cancellationToken);

        var requesterIds = requests.Values
            .Select(request => request.EmpId)
            .Distinct()
            .ToArray();

        var requesters = await dbContext.Employees
            .Include(employee => employee.Department)
            .Where(employee => requesterIds.Contains(employee.EmployeeId))
            .ToDictionaryAsync(employee => employee.EmployeeId, cancellationToken);

        var existingEvents = await dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(audit =>
                audit.AccessItemId.HasValue &&
                itemIds.Contains(audit.AccessItemId.Value) &&
                (audit.EventType == "request.expiring_soon" || audit.EventType == "request.expired"))
            .Select(audit => new { audit.AccessItemId, audit.EventType })
            .ToListAsync(cancellationToken);

        var reminderKeys = existingEvents
            .Where(x => x.EventType == "request.expiring_soon")
            .Select(x => x.AccessItemId!.Value)
            .ToHashSet();

        var expiredKeys = existingEvents
            .Where(x => x.EventType == "request.expired")
            .Select(x => x.AccessItemId!.Value)
            .ToHashSet();

        var itRecipients = await GetItApproversAsync(cancellationToken);
        var pendingExpirationNotifications = new List<(string EventType, AccessRequestEntity Request, AccessItemEntity Item, EmployeeEntity Requester, EmployeeEntity[] Recipients, DateTime ExpirationDateUtc, string Message)>();
        var hasStatusChanges = false;

        foreach (var item in grantedItems)
        {
            if (!approvalByItemId.TryGetValue(item.AccessItemId, out var approval))
            {
                continue;
            }

            if (!requests.TryGetValue(item.AccessReqId, out var accessRequest))
            {
                continue;
            }

            if (!requesters.TryGetValue(accessRequest.EmpId, out var requester))
            {
                continue;
            }

            var expirationDateUtc = GetExpirationDateUtc(approval.ModifiedOn ?? approval.CreatedOn);
            var reminderDateUtc = expirationDateUtc.AddDays(-ExpirationReminderDays);
            var hodRecipients = await GetDepartmentHodsAsync(requester.DeptId, cancellationToken);
            var recipients = BuildStageRecipients(requester, hodRecipients, itRecipients);

            if (utcNow >= expirationDateUtc && !expiredKeys.Contains(item.AccessItemId))
            {
                item.Status = RequestStatus.Expired;
                item.ModifiedBy = requester.EmployeeId.ToString();
                item.ModifiedOn = utcNow;
                hasStatusChanges = true;

                var message = $"Access for item #{item.AccessItemId} in request #{item.AccessReqId} expired on {expirationDateUtc:dd-MMM-yyyy}.";
                await AddAuditEntriesAsync(
                    item.AccessReqId,
                    item.AccessItemId,
                    null,
                    "request.expired",
                    message,
                    recipients,
                    requester.EmployeeId.ToString(),
                    utcNow,
                    cancellationToken);

                pendingExpirationNotifications.Add((
                    "request.expired",
                    accessRequest,
                    item,
                    requester,
                    recipients,
                    expirationDateUtc,
                    message));

                expiredKeys.Add(item.AccessItemId);
                continue;
            }

            if (utcNow >= reminderDateUtc && !reminderKeys.Contains(item.AccessItemId))
            {
                var message = $"Access for item #{item.AccessItemId} in request #{item.AccessReqId} will expire on {expirationDateUtc:dd-MMM-yyyy}.";
                await AddAuditEntriesAsync(
                    item.AccessReqId,
                    item.AccessItemId,
                    null,
                    "request.expiring_soon",
                    message,
                    recipients,
                    requester.EmployeeId.ToString(),
                    utcNow,
                    cancellationToken);

                pendingExpirationNotifications.Add((
                    "request.expiring_soon",
                    accessRequest,
                    item,
                    requester,
                    recipients,
                    expirationDateUtc,
                    message));

                reminderKeys.Add(item.AccessItemId);
            }
        }

        if (!hasStatusChanges && pendingExpirationNotifications.Count == 0)
        {
            return;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var notification in pendingExpirationNotifications)
        {
            await PushNotificationsAsync(
                notification.Recipients,
                notification.Request.AccessReqId,
                notification.EventType,
                notification.Message,
                utcNow,
                cancellationToken);

            if (notification.EventType == "request.expired")
            {
                await expirationService.SendExpiredEmailAsync(
                    notification.Request,
                    notification.Item,
                    notification.Requester,
                    notification.Recipients,
                    notification.ExpirationDateUtc,
                    cancellationToken);
            }
            else
            {
                await expirationService.SendExpiringSoonEmailAsync(
                    notification.Request,
                    notification.Item,
                    notification.Requester,
                    notification.Recipients,
                    notification.ExpirationDateUtc,
                    cancellationToken);
            }
        }
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
            .Include(employee => employee.Department)
            .ThenInclude(department => department!.Hod)
            .FirstOrDefaultAsync(employee => employee.EmployeeId == employeeId, cancellationToken)
            ?? throw new AppValidationException($"Employee {employeeId} was not found.");
    }

    private async Task<EmployeeEntity> EnsureRoleAsync(int employeeId, UserRole role, CancellationToken cancellationToken)
    {
        var employee = await GetEmployeeOrThrowAsync(employeeId, cancellationToken);

        if (employee.UserRole != role)
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

        var hod = await dbContext.Departments
            .AsNoTracking()
            .Where(department => department.DepartmentId == deptId.Value)
            .Select(department => department.Hod)
            .FirstOrDefaultAsync(cancellationToken);

        if (hod is null)
        {
            return new List<EmployeeEntity>();
        }

        if (hod.UserRole != UserRole.Hod)
        {
            return new List<EmployeeEntity>();
        }

        return new List<EmployeeEntity> { hod };
    }

    private async Task<EmployeeEntity> ResolveItApproverAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .Where(employee => employee.UserRole == UserRole.Admin)
            .OrderBy(employee => employee.EmployeeId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new AppValidationException("No IT approver is configured.");
    }

    private async Task<List<EmployeeEntity>> GetItApproversAsync(CancellationToken cancellationToken)
    {
        var admins = await dbContext.Employees
            .Where(employee => employee.UserRole == UserRole.Admin)
            .OrderBy(employee => employee.EmployeeId)
            .ToListAsync(cancellationToken);

        if (admins.Count == 0)
        {
            throw new AppValidationException("No IT approver is configured.");
        }

        return admins;
    }

    private async Task<List<EmployeeEntity>> GetFolderHodRecipientsAsync(IEnumerable<string> folderPaths, CancellationToken cancellationToken)
    {
        var normalizedPaths = folderPaths
            .Where(path => !string.IsNullOrWhiteSpace(path))
            .Select(NormalizeFolderPath)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedPaths.Count == 0)
        {
            return new List<EmployeeEntity>();
        }

        var mappings = await dbContext.FolderMappings
            .AsNoTracking()
            .Where(mapping => !string.IsNullOrWhiteSpace(mapping.FolderName))
            .ToListAsync(cancellationToken);

        if (mappings.Count == 0)
        {
            return new List<EmployeeEntity>();
        }

        var folderHodEmployeeIds = new HashSet<int>();
        var folderHodEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var folderHodUserNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var normalizedPath in normalizedPaths)
        {
            foreach (var mapping in mappings)
            {
                if (!FolderMappingMatchesPath(mapping.FolderName, normalizedPath))
                {
                    continue;
                }

                AddFolderHodIdentifiers(mapping.PrimaryHodId, mapping.PrimaryHodEmail, folderHodEmployeeIds, folderHodEmails, folderHodUserNames);
                AddFolderHodIdentifiers(mapping.SecondaryHodId, mapping.SecondaryHodEmail, folderHodEmployeeIds, folderHodEmails, folderHodUserNames);
            }
        }

        if (folderHodEmployeeIds.Count == 0 && folderHodEmails.Count == 0 && folderHodUserNames.Count == 0)
        {
            return new List<EmployeeEntity>();
        }

        var employees = await dbContext.Employees
            .AsNoTracking()
            .Where(employee => folderHodEmployeeIds.Contains(employee.EmployeeId)
                               || folderHodEmails.Contains(employee.Email)
                               || folderHodUserNames.Contains(employee.UserName))
            .ToListAsync(cancellationToken);

        return employees.DistinctBy(employee => employee.EmployeeId).ToList();
    }

    private static void AddFolderHodIdentifiers(
        string? hodId,
        string? hodEmail,
        HashSet<int> employeeIds,
        HashSet<string> emails,
        HashSet<string> usernames)
    {
        if (!string.IsNullOrWhiteSpace(hodId))
        {
            var trimmedId = hodId.Trim();
            if (int.TryParse(trimmedId, out var parsedEmployeeId))
            {
                employeeIds.Add(parsedEmployeeId);
            }
            else if (trimmedId.Contains("@"))
            {
                emails.Add(trimmedId);
            }
            else
            {
                usernames.Add(trimmedId);
            }
        }

        if (!string.IsNullOrWhiteSpace(hodEmail))
        {
            emails.Add(hodEmail.Trim());
        }
    }

    private static bool FolderMappingMatchesPath(string mappingFolder, string normalizedPath)
    {
        var normalizedMapping = NormalizeFolderPath(mappingFolder);

        if (string.Equals(normalizedPath, normalizedMapping, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!string.IsNullOrWhiteSpace(normalizedMapping) && normalizedPath.Contains(normalizedMapping, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        var pathSegments = normalizedPath.Split(new[] { '\\', '/' }, StringSplitOptions.RemoveEmptyEntries);
        return pathSegments.Any(segment => string.Equals(segment, normalizedMapping, StringComparison.OrdinalIgnoreCase));
    }

    private static string NormalizeFolderPath(string folderPath)
    {
        if (string.IsNullOrWhiteSpace(folderPath))
        {
            return string.Empty;
        }

        var normalized = folderPath.Trim().Replace('/', '\\');
        while (normalized.Contains("\\\\", StringComparison.Ordinal))
        {
            normalized = normalized.Replace("\\\\", "\\", StringComparison.Ordinal);
        }

        if (normalized.EndsWith("\\", StringComparison.Ordinal))
        {
            normalized = normalized[..^1];
        }

        return normalized.Trim();
    }

    private static void EnsureCanView(EmployeeEntity viewer, EmployeeEntity requester, AccessRequestEntity accessRequest)
    {
        if (viewer.UserRole == UserRole.Admin)
        {
            return;
        }

        if (viewer.UserRole == UserRole.Hod && viewer.DeptId == requester.DeptId)
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
                RecipientRole = recipient.UserRole.ToString(),
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

    private async Task SendStageEmailAsync(
        string eventType,
        string subject,
        string summary,
        AccessRequestEntity accessRequest,
        EmployeeEntity requester,
        IReadOnlyCollection<EmployeeEntity> recipients,
        AccessItemEntity? item,
        string? comments,
        DateTime? expirationDateUtc,
        CancellationToken cancellationToken)
    {
        await emailNotificationService.SendStageNotificationAsync(
            new AccessRequestEmailNotification(
                BuildMailProgramSuffix(eventType),
                subject,
                subject,
                summary,
                accessRequest,
                requester,
                recipients,
                item,
                comments,
                expirationDateUtc),
            cancellationToken);
    }

    private static EmployeeEntity[] BuildStageRecipients(
        EmployeeEntity requester,
        IEnumerable<EmployeeEntity> hodRecipients,
        IEnumerable<EmployeeEntity> itRecipients)
    {
        return new[] { requester }
            .Concat(hodRecipients)
            .Concat(itRecipients)
            .DistinctBy(employee => employee.EmployeeId)
            .ToArray();
    }

    private static string BuildMailProgramSuffix(string eventType) =>
        eventType.Replace(".", "_", StringComparison.Ordinal);

    private static DateTime GetExpirationDateUtc(DateTime grantedOnUtc) =>
        grantedOnUtc.AddDays(AccessExpirationDays);

    public async Task<AccessExpirationResponse> GetExpirationDateUtcWithTime(int accessItemId, CancellationToken cancellationToken)
    {
        var accessItem = await dbContext.AccessItems // Using AccessItems table per your schema
            .Where(x => x.AccessItemId == accessItemId && x.Status == RequestStatus.AccessGranted) // 📍 Validate status is Approved
            .Select(x => new { x.CreatedOn, x.ModifiedOn })
            .FirstOrDefaultAsync(cancellationToken);

        // If item isn't found OR status isn't approved, return null or throw
        if (accessItem == null)
        {
            return null; // Or throw new Exception("Item not found or not yet approved");
        }

        DateTime approvedDate = (accessItem.ModifiedOn.HasValue && accessItem.ModifiedOn > accessItem.CreatedOn)
            ? accessItem.ModifiedOn.Value
            : accessItem.CreatedOn;

        DateTime expiryDate = approvedDate;
        int addedDays = 0;
        while (addedDays < AccessExpirationDays)
        {
            expiryDate = expiryDate.AddDays(1);
            if (expiryDate.DayOfWeek != DayOfWeek.Sunday) addedDays++;
        }

        return new AccessExpirationResponse
        {
            ApprovedOn = approvedDate,
            ExpiresOn = expiryDate
        };
    }
}
