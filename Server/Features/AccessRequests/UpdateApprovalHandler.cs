using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Infrastructure.Persistence;

namespace Server.Features.AccessRequests;

public class UpdateApprovalHandler
{
    private readonly AppDbContext _db;
    private readonly AccessWorkflowService _workflow;

    public UpdateApprovalHandler(AppDbContext db, AccessWorkflowService workflow)
    {
        _db = db;
        _workflow = workflow;
    }

    public async Task<AccessApprovalResponseDto?> Handle(int requestId, int detailId, int approvalId, AccessApprovalActionDto action)
    {
        var approval = await _db.AccessApprovals
            .Include(a => a.AccessDetail)
            .ThenInclude(d => d.AccessRequest)
            .Include(a => a.AccessDetail)
            .ThenInclude(d => d.Approvals)
            .FirstOrDefaultAsync(a => a.Id == approvalId && a.AccessDetailId == detailId && a.AccessDetail.AccessRequestId == requestId);

        if (approval is null)
            return null;

        const string modifiedBy = "system";
        var normalizedStatus = action.Status.Trim();

        approval.Status = action.Status;
        approval.Comments = action.Comments;
        approval.ApproverEmpId = action.ApproverEmpId;
        approval.ModifiedOn = DateTime.UtcNow;
        approval.ModifiedBy = modifiedBy;

        var detail = approval.AccessDetail;
        var request = detail.AccessRequest;

        if (normalizedStatus.Equals(AccessWorkflowService.Approved, StringComparison.OrdinalIgnoreCase) &&
            action.ApprovalLevel == 2 &&
            detail.ExpiredAt is null)
        {
            detail.ExpiredAt = DateTime.UtcNow.AddDays(365);
        }

        _workflow.UpdateDetailStatus(detail, modifiedBy);
        _workflow.UpdateRequestStatus(request, modifiedBy);

        await AddNotificationsAsync(requestId, detail, approval, normalizedStatus, modifiedBy);
        await _workflow.AddAuditAsync(
            requestId,
            detailId,
            approvalId,
            action.ApproverEmpId,
            $"ApprovalLevel{action.ApprovalLevel}Updated",
            normalizedStatus,
            $"Approval level {action.ApprovalLevel} updated to {normalizedStatus} for request #{requestId}, detail #{detailId}.",
            action.Comments,
            modifiedBy);

        await _db.SaveChangesAsync();

        return approval.ToDto();
    }

    private async Task AddNotificationsAsync(int requestId, Domain.Entities.AccessDetail detail, Domain.Entities.AccessApproval approval, string status, string createdBy)
    {
        if (approval.ApprovalLevel == 1 &&
            status.Equals(AccessWorkflowService.Approved, StringComparison.OrdinalIgnoreCase))
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "HodApproved",
                $"HOD approved request #{requestId} for {detail.FolderPath}. It is now waiting for IT Infra approval.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, null, "ITInfra", "ApprovalPending",
                $"Request #{requestId} for {detail.FolderPath} is waiting for IT Infra approval.", createdBy);
        }
        else if (approval.ApprovalLevel == 1 &&
                 status.Equals(AccessWorkflowService.Rejected, StringComparison.OrdinalIgnoreCase))
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "HodRejected",
                $"HOD rejected request #{requestId} for {detail.FolderPath}.", createdBy);
        }
        else if (approval.ApprovalLevel == 2 &&
                 status.Equals(AccessWorkflowService.Approved, StringComparison.OrdinalIgnoreCase))
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "InfraApproved",
                $"IT Infra approved request #{requestId} for {detail.FolderPath}. Access granted until {detail.ExpiredAt:yyyy-MM-dd}.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, null, "HOD", "InfraApproved",
                $"IT Infra approved request #{requestId} for {detail.FolderPath}.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, approval.ApproverEmpId, "ITInfra", "InfraApproved",
                $"You approved request #{requestId} for {detail.FolderPath}.", createdBy);
        }
        else if (approval.ApprovalLevel == 2 &&
                 status.Equals(AccessWorkflowService.Rejected, StringComparison.OrdinalIgnoreCase))
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "InfraRejected",
                $"IT Infra rejected request #{requestId} for {detail.FolderPath}.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, null, "HOD", "InfraRejected",
                $"IT Infra rejected request #{requestId} for {detail.FolderPath}.", createdBy);
        }
        else
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "ApprovalUpdated",
                $"Approval level {approval.ApprovalLevel} changed to {status} for request #{requestId}.", createdBy);
        }
    }
}
