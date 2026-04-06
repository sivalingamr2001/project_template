using System.Text.Json;
using System.Text.Json.Serialization;
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
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        Converters = { new JsonStringEnumConverter() }
    };

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
        var requestId = await NextRequestIdAsync(cancellationToken);
        var ticketNumber = $"FAR-{requestId:0000}";
        var requestItems = items.Select(item =>
        {
            ValidateDraft(item);
            return AccessRequestItem.Create(NextAccessItemId(), item.FileName.Trim(), item.FolderPath.Trim(), item.AccessType.Trim(), item.BusinessReason.Trim());
        }).ToArray();

        var request = FileAccessRequest.Create(requestId, ticketNumber, requester.ToDomain(), requestItems, clock.GetUtcNow());
        var entity = ToEntity(request);
        dbContext.Requests.Add(entity);

        await CreateNotificationsAsync(
            request.RequestId,
            request.Items.Select(item => item.AccessItemId).ToArray(),
            "request.created",
            $"{requester.Name} created request {request.TicketNumber}.",
            await dbContext.Employees.Where(user => user.Role == "Hod" && user.DepartmentId == requester.DepartmentId).ToArrayAsync(cancellationToken),
            AccessReviewStage.Hod,
            cancellationToken);

        var camunda = await camundaWorkflowClient.StartAccessRequestAsync(request, cancellationToken);
        request.AttachCamunda(camunda);
        ApplyDocumentState(entity, request);

        await dbContext.SaveChangesAsync(cancellationToken);
        return request;
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

        var entity = await FindRequestDocumentOrThrowAsync(requestId, cancellationToken);
        var request = Deserialize(entity);
        if (request.DepartmentId != reviewer.DepartmentId)
        {
            throw new ForbiddenException("HOD can review only items from their department.");
        }

        var item = request.ReviewItemByHod(accessItemId, reviewer.ToDomain(), approved, note, clock.GetUtcNow());

        await CreateNotificationsAsync(
            request.RequestId,
            new[] { item.AccessItemId },
            approved ? "hod.approved" : "hod.rejected",
            approved ? $"HOD approved access item {item.AccessItemId}." : $"HOD rejected access item {item.AccessItemId}.",
            approved
                ? await dbContext.Employees.Where(user => user.Role == "ItTeam").ToArrayAsync(cancellationToken)
                : await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId).ToArrayAsync(cancellationToken),
            approved ? AccessReviewStage.ItTeam : AccessReviewStage.Requester,
            cancellationToken);

        request.AttachCamunda(await camundaWorkflowClient.PublishStateChangeAsync(request, approved ? "HodApproved" : "HodRejected", cancellationToken));
        ApplyDocumentState(entity, request);
        await dbContext.SaveChangesAsync(cancellationToken);
        return request;
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

        var entity = await FindRequestDocumentOrThrowAsync(requestId, cancellationToken);
        var request = Deserialize(entity);
        var item = request.ReviewItemByIt(accessItemId, reviewer.ToDomain(), approved, note, clock.GetUtcNow());

        await CreateNotificationsAsync(
            request.RequestId,
            new[] { item.AccessItemId },
            approved ? "it.approved" : "it.rejected",
            approved ? $"IT granted access item {item.AccessItemId}." : $"IT rejected access item {item.AccessItemId}.",
            approved
                ? await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId || user.Role == "ItTeam").ToArrayAsync(cancellationToken)
                : await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId || (user.Role == "Hod" && user.DepartmentId == request.DepartmentId)).ToArrayAsync(cancellationToken),
            approved ? AccessReviewStage.ItTeam : AccessReviewStage.Requester,
            cancellationToken);

        request.AttachCamunda(await camundaWorkflowClient.PublishStateChangeAsync(request, approved ? "ItApproved" : "ItRejected", cancellationToken));
        ApplyDocumentState(entity, request);
        await dbContext.SaveChangesAsync(cancellationToken);
        return request;
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
        var entity = await FindRequestDocumentOrThrowAsync(requestId, cancellationToken);
        var request = Deserialize(entity);
        var item = request.ResubmitItem(accessItemId, requester.ToDomain(), accessType, businessReason, clock.GetUtcNow());

        await CreateNotificationsAsync(
            request.RequestId,
            new[] { item.AccessItemId },
            "item.resubmitted",
            $"{requester.Name} resubmitted access item {item.AccessItemId}.",
            await dbContext.Employees.Where(user => user.Role == "Hod" && user.DepartmentId == requester.DepartmentId).ToArrayAsync(cancellationToken),
            AccessReviewStage.Hod,
            cancellationToken);

        request.AttachCamunda(await camundaWorkflowClient.PublishStateChangeAsync(request, "ItemResubmitted", cancellationToken));
        ApplyDocumentState(entity, request);
        await dbContext.SaveChangesAsync(cancellationToken);
        return request;
    }

    public async Task<FileAccessRequest> RenewAccessItemsAsync(
        int requestId,
        int requestedByEmployeeId,
        IReadOnlyList<int> accessItemIds,
        CancellationToken cancellationToken)
    {
        var requester = await FindUserOrThrowAsync(requestedByEmployeeId, cancellationToken);
        var sourceEntity = await FindRequestDocumentOrThrowAsync(requestId, cancellationToken);
        var sourceRequest = Deserialize(sourceEntity);
        if (sourceRequest.RequestedByEmployeeId != requestedByEmployeeId)
        {
            throw new ForbiddenException("Only the original requester can create renewals.");
        }

        var renewableItems = sourceRequest.Items
            .Where(item => accessItemIds.Contains(item.AccessItemId))
            .Select(item => item.CreateRenewal(NextAccessItemId()))
            .ToArray();

        if (renewableItems.Length == 0)
        {
            throw new ValidationException("No renewable access items were selected.");
        }

        var renewalId = await NextRequestIdAsync(cancellationToken);
        var renewal = FileAccessRequest.Create(renewalId, $"FAR-{renewalId:0000}", requester.ToDomain(), renewableItems, clock.GetUtcNow(), sourceRequest.RequestId);
        var renewalEntity = ToEntity(renewal);
        dbContext.Requests.Add(renewalEntity);

        await CreateNotificationsAsync(
            renewal.RequestId,
            renewal.Items.Select(item => item.AccessItemId).ToArray(),
            "request.renewal-created",
            $"{requester.Name} created renewal request {renewal.TicketNumber}.",
            await dbContext.Employees.Where(user => user.Role == "Hod" && user.DepartmentId == requester.DepartmentId).ToArrayAsync(cancellationToken),
            AccessReviewStage.Hod,
            cancellationToken);

        renewal.AttachCamunda(await camundaWorkflowClient.StartAccessRequestAsync(renewal, cancellationToken));
        ApplyDocumentState(renewalEntity, renewal);
        await dbContext.SaveChangesAsync(cancellationToken);
        return renewal;
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

        var entity = await FindRequestDocumentOrThrowAsync(requestId, cancellationToken);
        var request = Deserialize(entity);
        var item = request.RevokeItem(accessItemId, reviewer.ToDomain(), note, clock.GetUtcNow());

        await CreateNotificationsAsync(
            request.RequestId,
            new[] { item.AccessItemId },
            "it.revoked",
            $"{reviewer.Name} revoked access item {item.AccessItemId}.",
            await dbContext.Employees.Where(user => user.EmployeeId == request.RequestedByEmployeeId || (user.Role == "Hod" && user.DepartmentId == request.DepartmentId)).ToArrayAsync(cancellationToken),
            AccessReviewStage.ItTeam,
            cancellationToken);

        request.AttachCamunda(await camundaWorkflowClient.PublishStateChangeAsync(request, "AccessRevoked", cancellationToken));
        ApplyDocumentState(entity, request);
        await dbContext.SaveChangesAsync(cancellationToken);
        return request;
    }

    public async Task<IReadOnlyList<FileAccessRequest>> GetVisibleRequestsAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        await ExpireGrantedItemsAsync(cancellationToken);
        var user = await FindUserOrThrowAsync(employeeId, cancellationToken);
        IQueryable<RequestDocumentEntity> query = dbContext.Requests.AsNoTracking();

        query = user.Role switch
        {
            "User" => query.Where(request => request.RequestedByEmployeeId == employeeId),
            "Hod" => query.Where(request => request.DepartmentId == user.DepartmentId),
            "ItTeam" => query,
            _ => query.Where(_ => false)
        };

        var documents = await query.ToArrayAsync(cancellationToken);
        return documents
            .OrderByDescending(request => request.RequestedAtUtc)
            .Select(Deserialize)
            .ToArray();
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

    public sealed record AccessItemDraft(string FileName, string FolderPath, string AccessType, string BusinessReason);

    private async Task<EmployeeEntity> FindUserOrThrowAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees.SingleOrDefaultAsync(user => user.EmployeeId == employeeId, cancellationToken)
            ?? throw new NotFoundException("User was not found.");
    }

    private async Task<RequestDocumentEntity> FindRequestDocumentOrThrowAsync(int requestId, CancellationToken cancellationToken)
    {
        return await dbContext.Requests.SingleOrDefaultAsync(request => request.RequestId == requestId, cancellationToken)
            ?? throw new NotFoundException("Request was not found.");
    }

    private void ValidateDraft(AccessItemDraft item)
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

    private int NextAccessItemId()
    {
        var documents = dbContext.Requests.AsNoTracking().Select(request => request.JsonContent).ToArray();
        var max = 5000;
        foreach (var json in documents)
        {
            var request = JsonSerializer.Deserialize<FileAccessRequest>(json, JsonOptions);
            if (request is null)
            {
                continue;
            }

            foreach (var item in request.Items)
            {
                max = Math.Max(max, item.AccessItemId);
            }
        }

        return max + 1;
    }

    private RequestDocumentEntity ToEntity(FileAccessRequest request)
    {
        return new RequestDocumentEntity
        {
            RequestId = request.RequestId,
            ParentRequestId = request.ParentRequestId,
            TicketNumber = request.TicketNumber,
            RequestedByEmployeeId = request.RequestedByEmployeeId,
            DepartmentId = request.DepartmentId,
            RequestedAtUtc = request.RequestedAtUtc,
            AggregateStatus = request.AggregateStatus.ToString(),
            JsonContent = JsonSerializer.Serialize(request, JsonOptions),
            CamundaBusinessKey = request.Camunda?.BusinessKey,
            CamundaProcessInstanceId = request.Camunda?.ProcessInstanceId,
            CamundaLastAction = request.Camunda?.LastAction
        };
    }

    private void ApplyDocumentState(RequestDocumentEntity entity, FileAccessRequest request)
    {
        entity.ParentRequestId = request.ParentRequestId;
        entity.AggregateStatus = request.AggregateStatus.ToString();
        entity.JsonContent = JsonSerializer.Serialize(request, JsonOptions);
        entity.CamundaBusinessKey = request.Camunda?.BusinessKey;
        entity.CamundaProcessInstanceId = request.Camunda?.ProcessInstanceId;
        entity.CamundaLastAction = request.Camunda?.LastAction;
    }

    private FileAccessRequest Deserialize(RequestDocumentEntity entity)
    {
        var request = JsonSerializer.Deserialize<FileAccessRequest>(entity.JsonContent, JsonOptions)
            ?? throw new InvalidOperationException($"Request document {entity.RequestId} could not be deserialized.");

        using var document = JsonDocument.Parse(entity.JsonContent);
        var root = document.RootElement;

        if ((request.Items is null || request.Items.Count == 0) &&
            root.TryGetProperty(nameof(FileAccessRequest.Items), out var itemsElement) &&
            itemsElement.ValueKind == JsonValueKind.Array &&
            itemsElement.GetArrayLength() > 0)
        {
            request.Items = JsonSerializer.Deserialize<List<AccessRequestItem>>(itemsElement.GetRawText(), JsonOptions) ?? [];
            logger.LogWarning("Recovered {ItemCount} access item(s) from request document {RequestId} using JSON fallback hydration.", request.Items.Count, entity.RequestId);
        }

        if ((request.AuditTrail is null || request.AuditTrail.Count == 0) &&
            root.TryGetProperty(nameof(FileAccessRequest.AuditTrail), out var auditTrailElement) &&
            auditTrailElement.ValueKind == JsonValueKind.Array &&
            auditTrailElement.GetArrayLength() > 0)
        {
            request.AuditTrail = JsonSerializer.Deserialize<List<AccessAuditLog>>(auditTrailElement.GetRawText(), JsonOptions) ?? [];
            logger.LogWarning("Recovered {AuditCount} audit log item(s) from request document {RequestId} using JSON fallback hydration.", request.AuditTrail.Count, entity.RequestId);
        }

        if (request.Camunda is null &&
            root.TryGetProperty(nameof(FileAccessRequest.Camunda), out var camundaElement) &&
            camundaElement.ValueKind is not JsonValueKind.Null and not JsonValueKind.Undefined)
        {
            request.Camunda = JsonSerializer.Deserialize<CamundaProcessReference>(camundaElement.GetRawText(), JsonOptions);
        }

        return request;
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

        foreach (var notification in created)
        {
            await hubContext.Clients
                .Group(NotificationHub.GroupName(notification.RecipientEmployeeId))
                .SendAsync("notification.created", notification.ToSignalrPayload(), cancellationToken);
        }
    }

    private async Task ExpireGrantedItemsAsync(CancellationToken cancellationToken)
    {
        var documents = await dbContext.Requests.ToArrayAsync(cancellationToken);
        var changed = false;

        foreach (var entity in documents)
        {
            var request = Deserialize(entity);
            var before = request.Items.Select(item => (item.AccessItemId, item.Status)).ToDictionary(x => x.AccessItemId, x => x.Status);
            request.ExpireItems(clock.GetUtcNow());

            foreach (var item in request.Items.Where(item => before[item.AccessItemId] != item.Status && item.Status == FileAccessRequestStatus.Expired))
            {
                changed = true;
                logger.LogInformation("Access item {AccessItemId} in request {RequestId} expired", item.AccessItemId, request.RequestId);
                var recipients = await dbContext.Employees
                    .Where(user => user.EmployeeId == request.RequestedByEmployeeId ||
                                   (user.Role == "Hod" && user.DepartmentId == request.DepartmentId) ||
                                   user.Role == "ItTeam")
                    .ToArrayAsync(cancellationToken);
                await CreateNotificationsAsync(request.RequestId, new[] { item.AccessItemId }, "item.expired", $"Access item {item.AccessItemId} expired and needs renewal.", recipients, AccessReviewStage.System, cancellationToken);
            }

            if (changed)
            {
                ApplyDocumentState(entity, request);
            }
        }

        if (changed)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}

internal static class EmployeeEntityMappingExtensions
{
    public static AppUser ToDomain(this EmployeeEntity entity)
    {
        return new AppUser(
            entity.EmployeeId,
            entity.EmployeeCode,
            entity.Name,
            entity.Email,
            entity.DepartmentId,
            entity.DepartmentName,
            Enum.Parse<UserRole>(entity.Role, ignoreCase: true));
    }

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
