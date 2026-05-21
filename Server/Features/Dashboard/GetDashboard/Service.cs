using System.Linq;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;

namespace Server.Features.Dashboard.GetDashboard;

public sealed class GetDashboardService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<DashboardAccessRequestDto>> GetAsync(
    int userId,
    GetDashboardQuery query,
    CancellationToken cancellationToken)
    {
        var profile = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .Select(e => new
            {
                Role = e.UserRole
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (profile is null)
        {
            return new PaginatedResponse<DashboardAccessRequestDto>([], 0, query.NormalizedPage, query.NormalizedPageSize);
        }

        IQueryable<AccessRequestEntity> requestQuery = dbContext.AccessRequests.AsNoTracking();

        if (profile.Role != UserRole.Admin && profile.Role != UserRole.Operator)
        {
            // Local DB no longer stores department membership; restrict to self for non-admin/operator.
            requestQuery = requestQuery.Where(request => request.UserId == userId);
        }

        var totalCount = await requestQuery.CountAsync(cancellationToken);

        // 3. Projection into DTOs
        var data = await requestQuery
            .OrderByDescending(r => r.AccessReqId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(request => new DashboardAccessRequestDto(
                request.AccessReqId,
                request.UserId,
                request.ReqTo,
                request.ItsrNo,
                request.IsAgreed,
                dbContext.AccessItems
                    .Where(ai => ai.AccessReqId == request.AccessReqId)
                    .Select(ai => new AccessItemDto(
                        ai.AccessItemId,
                        ai.TicketNumber,
                        ai.Status,
                        ai.FolderPath,
                        ai.Reason,
                        ai.AccessType))
                    .ToList(),
                dbContext.AccessApprovals
                    .Where(a => a.AccessReqId == request.AccessReqId)
                    .Select(a => new ApprovalItemDto(
                        a.AccessReqId,
                        a.ApproverId,
                        a.ApprovalStatus,
                        a.Comments))
                    .ToList()
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<DashboardAccessRequestDto>(data, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }

    private sealed record EmployeeProfile(string Role);
}
