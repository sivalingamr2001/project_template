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
        int employeeId,
        GetDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var profile = await dbContext.Employees
            .AsNoTracking()
            .Where(employee => employee.EmployeeId == employeeId)
            .Select(employee => new EmployeeProfile(employee.DeptName, employee.UserRole))
            .FirstOrDefaultAsync(cancellationToken);

        if (profile is null)
        {
            return new PaginatedResponse<DashboardAccessRequestDto>([], 0, query.NormalizedPage, query.NormalizedPageSize);
        }

        IQueryable<AccessRequestEntity> requestQuery = dbContext.AccessRequests.AsNoTracking();

        if (profile.Role == RoleNames.Hod)
        {
            requestQuery =
                from request in requestQuery
                join employee in dbContext.Employees.AsNoTracking() on request.EmpId equals employee.EmployeeId
                where employee.DeptName == profile.DepartmentName
                select request;
        }
        else if (profile.Role != RoleNames.Admin)
        {
            requestQuery = requestQuery.Where(request => request.EmpId == employeeId);
        }

        var totalCount = await requestQuery.CountAsync(cancellationToken);

        var data = await requestQuery
        .OrderByDescending(r => r.AccessReqId)
        .Skip(query.Skip)
        .Take(query.NormalizedPageSize)
        .Select(request => new DashboardAccessRequestDto(
            request.AccessReqId,
            request.EmpId,
            request.ReqTo,
            request.ItsrNo,
            request.IsAgreed,
            // Project AccessItems
            dbContext.AccessItems
                .Where(ai => ai.AccessReqId == request.AccessReqId)
                .Select(ai => new AccessItemDto(
                    ai.AccessItemId,
                    ai.Status,
                    ai.FolderPath,
                    ai.Reason,
                    ai.AccessType))
                .ToList(),
            // Project ApprovalItems (assuming a table exists)
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

        var enrichedData = data
            .ToList();

        return new PaginatedResponse<DashboardAccessRequestDto>(enrichedData, totalCount, query.NormalizedPage, query.NormalizedPageSize);
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

    private static AggregateRequestStatus DeriveAggregateStatus(IEnumerable<RequestStatus> statuses)
    {
        if (statuses.Any(status => status == RequestStatus.Revoked))
        {
            return AggregateRequestStatus.Revoked;
        }

        if (statuses.Any(status => status == RequestStatus.Expired))
        {
            return AggregateRequestStatus.Expired;
        }

        if (statuses.Any(status => status == RequestStatus.RejectedHOD || status == RequestStatus.RejectedIT || status == RequestStatus.AccessRejected))
        {
            return AggregateRequestStatus.Rejected;
        }

        if (statuses.Any(status => status == RequestStatus.AccessGranted))
        {
            return AggregateRequestStatus.Approved;
        }

        return AggregateRequestStatus.Pending;
    }

    private sealed record EmployeeProfile(string DepartmentName, string Role);
}
