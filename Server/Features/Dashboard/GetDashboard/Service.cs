using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
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
            .Select(employee => new EmployeeProfile(employee.DepartmentName, employee.Role))
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
                where employee.DepartmentName == profile.DepartmentName
                select request;
        }
        else if (profile.Role != RoleNames.ItTeam)
        {
            requestQuery = requestQuery.Where(request => request.EmpId == employeeId);
        }

        var totalCount = await requestQuery.CountAsync(cancellationToken);

        var rows = await (
            from request in requestQuery
            join item in dbContext.AccessItems.AsNoTracking() on request.AccessReqId equals item.AccessReqId
            orderby request.AccessReqId descending
            select new
            {
                request.AccessReqId,
                request.EmpId,
                request.ReqTo,
                request.AggregateStatus,
                request.Status,
                request.ItsrNo,
                request.IsAgreed,
                item.AccessItemId,
                item.FolderPath,
                item.Reason,
                item.AccessType,
            }
        )
        .Skip(query.Skip)
        .Take(query.NormalizedPageSize)
        .ToListAsync(cancellationToken);

        var data = rows
            .Select(row => new DashboardAccessRequestDto(
                row.AccessReqId,
                row.EmpId,
                row.ReqTo,
                row.AggregateStatus,
                row.Status,
                row.ItsrNo,
                row.IsAgreed,
                row.AccessItemId,
                row.FolderPath,
                row.Reason,
                row.AccessType
            ))
            .ToList();

        return new PaginatedResponse<DashboardAccessRequestDto>(data, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }

    private sealed record EmployeeProfile(string DepartmentName, string Role);
}
