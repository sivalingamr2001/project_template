using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Infrastructure.Persistence;

namespace Server.Features.AccessRequests;

public static class AccessRequestEndpoints
{
    public static void MapAccessRequestEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/access-requests", async (AccessRequestCreateDto req, CreateAccessRequestHandler handler) =>
        {
            var result = await handler.Handle(req);
            return Results.Created($"/access-requests/{result.Id}", result);
        });

        app.MapGet("/access-requests", async (AppDbContext db) =>
        {
            var requests = await db.AccessRequests
                .Include(r => r.Details)
                .ThenInclude(d => d.Approvals)
                .OrderByDescending(r => r.CreatedOn)
                .ToListAsync();

            return Results.Ok(requests.Select(r => r.ToDto()));
        });

        app.MapGet("/access-requests/{requestId:int}", async (int requestId, AppDbContext db) =>
        {
            var request = await db.AccessRequests
                .Include(r => r.Details)
                .ThenInclude(d => d.Approvals)
                .Where(r => r.Id == requestId)
                .FirstOrDefaultAsync();

            return request is null ? Results.NotFound() : Results.Ok(request.ToDto());
        });

        app.MapGet("/access-requests/by-user/{empId:int}", async (int empId, AppDbContext db) =>
        {
            var requests = await db.AccessRequests
                .Include(r => r.Details)
                .ThenInclude(d => d.Approvals)
                .Where(r => r.EmpId == empId)
                .OrderByDescending(r => r.CreatedOn)
                .ToListAsync();

            return Results.Ok(requests.Select(r => r.ToDto()));
        });

        app.MapGet("/access-requests/hod/{hodId:int}/pending", async (int hodId, AppDbContext db) =>
        {
            var pendingRequests = await db.AccessApprovals
                .Include(a => a.AccessDetail)
                .ThenInclude(d => d.AccessRequest)
                .Where(a =>
                    a.ApprovalLevel == 1 &&
                    a.Status == AccessWorkflowService.Pending &&
                    (a.ApproverEmpId == 0 || a.ApproverEmpId == hodId))
                .OrderBy(a => a.AccessDetail.AccessRequest.CreatedOn)
                .Select(a => new PendingApprovalQueueItemDto(
                    a.AccessDetail.AccessRequestId,
                    a.AccessDetailId,
                    a.Id,
                    a.AccessDetail.AccessRequest.EmpId,
                    a.ApproverEmpId,
                    a.ApprovalLevel,
                    a.AccessDetail.AccessRequest.Status,
                    a.AccessDetail.Status,
                    a.Status,
                    a.AccessDetail.FolderPath,
                    a.AccessDetail.AccessType,
                    a.AccessDetail.Reason,
                    a.AccessDetail.ExpiredAt,
                    a.AccessDetail.AccessRequest.ITSRNumber,
                    a.AccessDetail.AccessRequest.CreatedOn,
                    a.Comments
                ))
                .ToListAsync();

            return Results.Ok(pendingRequests);
        });

        app.MapGet("/access-requests/infra/{infraEmpId:int}/pending", async (int infraEmpId, AppDbContext db) =>
        {
            var pendingRequests = await db.AccessApprovals
                .Include(a => a.AccessDetail)
                .ThenInclude(d => d.AccessRequest)
                .Where(a =>
                    a.ApprovalLevel == 2 &&
                    a.Status == AccessWorkflowService.Pending &&
                    (a.ApproverEmpId == 0 || a.ApproverEmpId == infraEmpId) &&
                    a.AccessDetail.Approvals.Any(s => s.ApprovalLevel == 1 && s.Status == AccessWorkflowService.Approved))
                .OrderBy(a => a.AccessDetail.AccessRequest.CreatedOn)
                .Select(a => new PendingApprovalQueueItemDto(
                    a.AccessDetail.AccessRequestId,
                    a.AccessDetailId,
                    a.Id,
                    a.AccessDetail.AccessRequest.EmpId,
                    a.ApproverEmpId,
                    a.ApprovalLevel,
                    a.AccessDetail.AccessRequest.Status,
                    a.AccessDetail.Status,
                    a.Status,
                    a.AccessDetail.FolderPath,
                    a.AccessDetail.AccessType,
                    a.AccessDetail.Reason,
                    a.AccessDetail.ExpiredAt,
                    a.AccessDetail.AccessRequest.ITSRNumber,
                    a.AccessDetail.AccessRequest.CreatedOn,
                    a.Comments
                ))
                .ToListAsync();

            return Results.Ok(pendingRequests);
        });

        app.MapGet("/access-requests/active-access", async ([FromQuery] int? empId, AppDbContext db) =>
        {
            var query = db.AccessDetails
                .Include(d => d.AccessRequest)
                .Where(d =>
                    d.Status == AccessWorkflowService.Approved &&
                    d.AccessRequest.Status == AccessWorkflowService.Approved &&
                    !d.AccessRequest.IsRevoke &&
                    d.IsActive);

            if (empId.HasValue)
            {
                query = query.Where(d => d.AccessRequest.EmpId == empId.Value);
            }

            var items = await query
                .OrderByDescending(d => d.ModifiedOn)
                .Select(d => new ActiveAccessDto(
                    d.AccessRequestId,
                    d.Id,
                    d.AccessRequest.EmpId,
                    d.FolderPath,
                    d.AccessType,
                    d.Status,
                    d.ExpiredAt,
                    d.ExpiredAt.HasValue && d.ExpiredAt.Value < DateTime.UtcNow,
                    d.AccessRequest.ITSRNumber,
                    d.AccessRequest.CreatedOn
                ))
                .ToListAsync();

            return Results.Ok(items);
        });

        app.MapGet("/access-requests/expiring", async ([FromQuery] int days, [FromQuery] int? empId, AppDbContext db) =>
        {
            var windowDays = days <= 0 ? 30 : days;
            var threshold = DateTime.UtcNow.AddDays(windowDays);

            var query = db.AccessDetails
                .Include(d => d.AccessRequest)
                .Where(d =>
                    d.Status == AccessWorkflowService.Approved &&
                    d.ExpiredAt.HasValue &&
                    d.ExpiredAt.Value <= threshold &&
                    !d.AccessRequest.IsRevoke);

            if (empId.HasValue)
            {
                query = query.Where(d => d.AccessRequest.EmpId == empId.Value);
            }

            var items = await query
                .OrderBy(d => d.ExpiredAt)
                .Select(d => new ActiveAccessDto(
                    d.AccessRequestId,
                    d.Id,
                    d.AccessRequest.EmpId,
                    d.FolderPath,
                    d.AccessType,
                    d.Status,
                    d.ExpiredAt,
                    d.ExpiredAt.HasValue && d.ExpiredAt.Value < DateTime.UtcNow,
                    d.AccessRequest.ITSRNumber,
                    d.AccessRequest.CreatedOn
                ))
                .ToListAsync();

            return Results.Ok(items);
        });

        app.MapGet("/access-approvals/audit", async (AppDbContext db) =>
        {
            var audit = await db.AccessAuditLogs
                .OrderByDescending(a => a.CreatedOn)
                .Select(a => new AccessAuditLogResponseDto(
                    a.Id,
                    a.AccessRequestId,
                    a.AccessDetailId,
                    a.AccessApprovalId,
                    a.ActorEmpId,
                    a.EventType,
                    a.Status,
                    a.Message,
                    a.Comments,
                    a.CreatedOn,
                    a.CreatedBy
                ))
                .ToListAsync();

            return Results.Ok(audit);
        });

        app.MapGet("/access-approvals/history", async (AppDbContext db) =>
        {
            var history = await db.AccessApprovals
                .OrderByDescending(a => a.ModifiedOn)
                .Select(a => new AccessApprovalResponseDto(
                    a.Id,
                    a.AccessDetailId,
                    a.ApproverEmpId,
                    a.ApprovalLevel,
                    a.Status,
                    a.Comments,
                    a.CreatedOn,
                    a.CreatedBy,
                    a.ModifiedOn,
                    a.ModifiedBy
                ))
                .OrderByDescending(a => a.CreatedOn)
                .ToListAsync();

            return Results.Ok(history);
        });

        app.MapGet("/notifications", async ([FromQuery] int? empId, [FromQuery] string? recipientType, AppDbContext db) =>
        {
            var query = db.AccessNotifications.AsQueryable();

            if (empId.HasValue)
            {
                query = query.Where(n => n.RecipientEmpId == empId.Value);
            }

            if (!string.IsNullOrWhiteSpace(recipientType))
            {
                query = query.Where(n => n.RecipientType == recipientType);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedOn)
                .Select(n => new AccessNotificationResponseDto(
                    n.Id,
                    n.AccessRequestId,
                    n.AccessDetailId,
                    n.AccessApprovalId,
                    n.RecipientEmpId,
                    n.RecipientType,
                    n.EventType,
                    n.Message,
                    n.IsRead,
                    n.CreatedOn,
                    n.CreatedBy
                ))
                .ToListAsync();

            return Results.Ok(notifications);
        });

        app.MapPost("/access-requests/{requestId:int}/revoke", async (int requestId, RevokeAccessRequestHandler handler) =>
        {
            var ok = await handler.Handle(requestId, "system");
            return ok ? Results.Ok() : Results.NotFound();
        });

        app.MapPost("/access-requests/{requestId:int}/details/{detailId:int}/approvals/{approvalId:int}",
            async (int requestId, int detailId, int approvalId, AccessApprovalActionDto action, UpdateApprovalHandler handler) =>
            {
                var result = await handler.Handle(requestId, detailId, approvalId, action);
                return result is null ? Results.NotFound() : Results.Ok(result);
            });

        app.MapPut("/access-requests/{requestId:int}/details/{detailId:int}/approvals/{approvalId:int}",
            async (int requestId, int detailId, int approvalId, AccessApprovalActionDto action, UpdateApprovalHandler handler) =>
            {
                var result = await handler.Handle(requestId, detailId, approvalId, action);
                return result is null ? Results.NotFound() : Results.Ok(result);
            });
    }
}
