using Server.Application.DTOs;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.AccessRequests;

public class CreateAccessRequestHandler
{
    private readonly AppDbContext _db;
    private readonly AccessWorkflowService _workflow;

    public CreateAccessRequestHandler(AppDbContext db, AccessWorkflowService workflow)
    {
        _db = db;
        _workflow = workflow;
    }

    public async Task<AccessRequestResponseDto> Handle(AccessRequestCreateDto request)
    {
        var now = DateTime.UtcNow;
        const string createdBy = "system";

        var entity = new AccessRequest
        {
            EmpId = request.EmpId,
            Status = "Pending",
            IsAgreed = request.IsAgreed,
            IsRevoke = request.IsRevoke,
            ITSRNumber = request.ITSRNumber,
            CreatedOn = now,
            CreatedBy = createdBy,
            ModifiedOn = now,
            ModifiedBy = createdBy
        };

        foreach (var item in request.Details)
        {
            var detail = new AccessDetail
            {
                FolderPath = item.FolderPath,
                AccessType = item.AccessType,
                Reason = item.Reason ?? string.Empty,
                ExpiredAt = item.ExpiredAt,
                Status = AccessStatus.PendingHOD,
                CreatedOn = now,
                CreatedBy = createdBy,
                ModifiedOn = now,
                ModifiedBy = createdBy
            };

            detail.Approvals.Add(new AccessApproval
            {
                ApproverEmpId = 0,
                ApprovalLevel = ApprovalType.HOD,
                Status = AccessStatus.PendingHOD,
                CreatedOn = now,
                CreatedBy = createdBy,
                ModifiedOn = now,
                ModifiedBy = createdBy
            });

            detail.Approvals.Add(new AccessApproval
            {
                ApproverEmpId = 0,
                ApprovalLevel = ApprovalType.IT,
                Status = AccessStatus.PendingIT,
                CreatedOn = now,
                CreatedBy = createdBy,
                ModifiedOn = now,
                ModifiedBy = createdBy
            });

            entity.Details.Add(detail);
        }

        _db.AccessRequests.Add(entity);
        await _db.SaveChangesAsync();

        await _workflow.AddAuditAsync(
            entity.Id,
            null,
            null,
            entity.EmpId,
            "RequestCreated",
            entity.Status,
            $"Access request created by employee {entity.EmpId}.",
            null,
            createdBy);

        await _workflow.AddNotificationAsync(entity.Id, null, null, entity.EmpId, "User", "RequestCreated",
            $"Your access request #{entity.Id} was created and sent to HOD for approval.", createdBy);
        await _workflow.AddNotificationAsync(entity.Id, null, null, null, "HOD", "ApprovalPending",
            $"Access request #{entity.Id} is waiting for HOD approval.", createdBy);
        await _db.SaveChangesAsync();

        return entity.ToDto();
    }
}
