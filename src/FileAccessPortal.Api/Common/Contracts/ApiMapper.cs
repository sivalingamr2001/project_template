using FileAccessPortal.Api.Common.Persistence.Entities;
using FileAccessPortal.Domain.Entities;

namespace FileAccessPortal.Api.Common.Contracts;

public static class ApiMapper
{
    public static UserResponse ToResponse(this AppUser user)
    {
        return new UserResponse(
            user.EmployeeId,
            user.EmployeeCode,
            user.Name,
            user.Email,
            user.DepartmentId,
            user.DepartmentName,
            user.Role.ToString());
    }

    public static NotificationResponse ToResponse(this AccessNotification notification)
    {
        return new NotificationResponse(
            notification.Id,
            notification.RequestId,
            notification.AccessItemId,
            notification.EventType,
            notification.Message,
            notification.RecipientStage.ToString(),
            notification.CreatedAtUtc,
            notification.IsRead);
    }

    public static UserResponse ToResponse(this EmployeeEntity employee)
    {
        return new UserResponse(
            employee.EmployeeId,
            employee.EmployeeCode,
            employee.Name,
            employee.Email,
            employee.DepartmentId,
            employee.DepartmentName,
            employee.Role);
    }

    public static NotificationResponse ToResponse(this NotificationEntity notification)
    {
        return new NotificationResponse(
            notification.Id,
            notification.RequestId,
            notification.AccessItemId,
            notification.EventType,
            notification.Message,
            notification.RecipientStage,
            notification.CreatedAtUtc,
            notification.IsRead);
    }

    public static AuditResponse ToResponse(this AccessAuditLog log)
    {
        return new AuditResponse(
            log.Id,
            log.RequestId,
            log.AccessItemId,
            log.Stage.ToString(),
            log.EventType,
            log.Message,
            log.ActorEmployeeId,
            log.ActorName,
            log.Comments,
            log.HappenedAtUtc);
    }

    public static AccessItemResponse ToResponse(this AccessRequestItem item)
    {
        return new AccessItemResponse(
            item.AccessItemId,
            item.FileName,
            item.FolderPath,
            item.AccessType,
            item.BusinessReason,
            item.Status.ToString(),
            item.ResubmissionCount,
            item.ApprovedUntilUtc,
            item.RevokedAtUtc,
            item.RejectionReason,
            item.RejectedByStage?.ToString(),
            item.HodReviewerEmployeeId,
            item.HodReviewerName,
            item.HodReviewedAtUtc,
            item.HodNote,
            item.ItReviewerEmployeeId,
            item.ItReviewerName,
            item.ItReviewedAtUtc,
            item.ItNote);
    }

    public static RequestResponse ToResponse(this FileAccessRequest request)
    {
        return new RequestResponse(
            request.RequestId,
            request.ParentRequestId,
            request.TicketNumber,
            request.RequestedByEmployeeId,
            request.RequestedByName,
            request.DepartmentId,
            request.DepartmentName,
            request.AggregateStatus.ToString(),
            request.RequestedAtUtc,
            request.Camunda?.BusinessKey,
            request.Camunda?.ProcessInstanceId,
            request.Camunda?.LastAction,
            request.Items.Select(item => item.ToResponse()).ToArray(),
            request.AuditTrail
                .OrderByDescending(log => log.HappenedAtUtc)
                .Select(log => log.ToResponse())
                .ToArray());
    }
}
