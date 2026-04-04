using Server.Application.DTOs;
using Server.Domain.Entities;

namespace Server.Features.AccessRequests;

public static class AccessRequestMapper
{
    public static AccessRequestResponseDto ToDto(this AccessRequest request) => new(
        request.Id,
        request.EmpId,
        request.Status,
        request.IsAgreed,
        request.IsRevoke,
        request.IsActive,
        request.ITSRNumber,
        request.CreatedOn,
        request.CreatedBy,
        request.ModifiedOn,
        request.ModifiedBy,
        request.Details
            .OrderBy(d => d.Id)
            .Select(ToDto)
            .ToList());

    public static AccessDetailResponseDto ToDto(this AccessDetail detail) => new(
        detail.Id,
        detail.AccessRequestId,
        detail.FolderPath,
        detail.AccessType,
        detail.Reason,
        detail.Status,
        detail.ExpiredAt,
        detail.IsActive,
        detail.CreatedOn,
        detail.CreatedBy,
        detail.ModifiedOn,
        detail.ModifiedBy,
        detail.Approvals
            .OrderBy(a => a.ApprovalLevel)
            .ThenBy(a => a.Id)
            .Select(ToDto)
            .ToList());

    public static AccessApprovalResponseDto ToDto(this AccessApproval approval) => new(
        approval.Id,
        approval.AccessDetailId,
        approval.ApproverEmpId,
        approval.ApprovalLevel,
        approval.Status,
        approval.Comments,
        approval.CreatedOn,
        approval.CreatedBy,
        approval.ModifiedOn,
        approval.ModifiedBy);
}
