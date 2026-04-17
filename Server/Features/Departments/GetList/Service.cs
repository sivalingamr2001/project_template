using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Features.Common;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Departments.GetList;

public sealed class GetDepartmentsService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<DepartmentDto>> GetAsync(
        GetDepartmentQuery query,
        CancellationToken cancellationToken)
    {
        var baseQuery = dbContext.Departments
            .AsNoTracking()
            .OrderBy(d => d.DeptId)
            .Select(d => new DepartmentDto(
                d.Id,
                d.DeptId,
                d.DeptName,
                d.DeptHodId,
                d.HeadOfDepartment != null
                    ? GetDisplayName(d.HeadOfDepartment.FirstName, d.HeadOfDepartment.LastName, d.HeadOfDepartment.UserName)
                    : string.Empty,
                d.HeadOfDepartment != null
                    ? d.HeadOfDepartment.Email ?? string.Empty
                    : string.Empty,
                d.HeadOfDepartment != null
                    ? d.HeadOfDepartment.Mobile ?? string.Empty
                    : string.Empty));

        var totalCount = await dbContext.Departments.AsNoTracking().CountAsync(cancellationToken);

        var departments = await baseQuery
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<DepartmentDto>(departments, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }

    private static string GetDisplayName(string? firstName, string? lastName, string userName)
    {
        var combined = $"{firstName ?? string.Empty} {lastName ?? string.Empty}".Trim();
        return !string.IsNullOrWhiteSpace(combined) ? combined : userName;
    }
}
