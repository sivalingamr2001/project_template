using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Domain.Enums;
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

        approval.Status = action.Status;
        approval.Comments = action.Comments;
        approval.ApproverEmpId = action.ApproverEmpId;
        approval.ModifiedOn = DateTime.UtcNow;
        approval.ModifiedBy = modifiedBy;

        var detail = approval.AccessDetail;
        var request = detail.AccessRequest;

        if (action.Status == AccessStatus.Approved &&
            action.ApprovalLevel == ApprovalType.IT &&
            detail.ExpiredAt is null)
        {
            detail.ExpiredAt = DateTime.UtcNow.AddDays(365);
        }

        _workflow.UpdateDetailStatus(detail, modifiedBy);
        _workflow.UpdateRequestStatus(request, modifiedBy);

        await AddNotificationsAsync(requestId, detail, approval, action.Status, modifiedBy);
        await _workflow.AddAuditAsync(
            requestId,
            detailId,
            approvalId,
            action.ApproverEmpId,
            $"ApprovalLevel{action.ApprovalLevel}Updated",
            action.Status.ToString(),
            $"Approval level {action.ApprovalLevel} updated to {action.Status} for request #{requestId}, detail #{detailId}.",
            action.Comments,
            modifiedBy);

        await _db.SaveChangesAsync();

        return approval.ToDto();
    }

    private async Task AddNotificationsAsync(int requestId, Domain.Entities.AccessDetail detail, Domain.Entities.AccessApproval approval, AccessStatus status, string createdBy)
    {
        if (approval.ApprovalLevel == ApprovalType.HOD &&
            status == AccessStatus.Approved)
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "HodApproved",
                $"HOD approved request #{requestId} for {detail.FolderPath}. It is now waiting for IT Infra approval.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, null, "ITInfra", "ApprovalPending",
                $"Request #{requestId} for {detail.FolderPath} is waiting for IT Infra approval.", createdBy);
        }
        else if (approval.ApprovalLevel == ApprovalType.HOD &&
                 status == AccessStatus.Rejected)
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "HodRejected",
                $"HOD rejected request #{requestId} for {detail.FolderPath}.", createdBy);
        }
        else if (approval.ApprovalLevel == ApprovalType.IT &&
                 status == AccessStatus.Approved)
        {
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, detail.AccessRequest.EmpId, "User", "InfraApproved",
                $"IT Infra approved request #{requestId} for {detail.FolderPath}. Access granted until {detail.ExpiredAt:yyyy-MM-dd}.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, null, "HOD", "InfraApproved",
                $"IT Infra approved request #{requestId} for {detail.FolderPath}.", createdBy);
            await _workflow.AddNotificationAsync(requestId, detail.Id, approval.Id, approval.ApproverEmpId, "ITInfra", "InfraApproved",
                $"You approved request #{requestId} for {detail.FolderPath}.", createdBy);
        }
        else if (approval.ApprovalLevel == ApprovalType.IT &&
                 status == AccessStatus.Rejected)
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
