using Microsoft.EntityFrameworkCore;
using Server.Domain.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.AccessRequests;

public class RevokeAccessRequestHandler
{
    private readonly AppDbContext _db;
    private readonly AccessWorkflowService _workflow;

    public RevokeAccessRequestHandler(AppDbContext db, AccessWorkflowService workflow)
    {
        _db = db;
        _workflow = workflow;
    }

    public async Task<bool> Handle(int requestId, string modifiedBy)
    {
        var request = await _db.AccessRequests
            .Include(r => r.Details)
            .ThenInclude(d => d.Approvals)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
            return false;

        request.IsRevoke = true;
        request.Status = "Revoked";
        request.ModifiedOn = DateTime.UtcNow;
        request.ModifiedBy = modifiedBy;

        foreach (var detail in request.Details)
        {
            detail.Status = AccessStatus.Revoked;
            detail.ModifiedOn = DateTime.UtcNow;
            detail.ModifiedBy = modifiedBy;

            foreach (var approval in detail.Approvals.Where(a => a.Status != AccessStatus.Approved && a.Status != AccessStatus.Rejected))
            {
                approval.Status = AccessStatus.Revoked;
                approval.ModifiedOn = DateTime.UtcNow;
                approval.ModifiedBy = modifiedBy;
            }
        }

        await _workflow.AddAuditAsync(request.Id, null, null, request.EmpId, "RequestRevoked", request.Status,
            $"Access request #{request.Id} was revoked.", null, modifiedBy);
        await _workflow.AddNotificationAsync(request.Id, null, null, request.EmpId, "User", "RequestRevoked",
            $"Access request #{request.Id} was revoked.", modifiedBy);
        await _workflow.AddNotificationAsync(request.Id, null, null, null, "HOD", "RequestRevoked",
            $"Access request #{request.Id} was revoked by the user or system.", modifiedBy);
        await _workflow.AddNotificationAsync(request.Id, null, null, null, "ITInfra", "RequestRevoked",
            $"Access request #{request.Id} was revoked by the user or system.", modifiedBy);

        await _db.SaveChangesAsync();
        return true;
    }
}
