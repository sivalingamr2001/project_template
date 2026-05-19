using Microsoft.EntityFrameworkCore;
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
        var totalCount = await dbContext.Departments.AsNoTracking().CountAsync(cancellationToken);

        var departmentRows = await dbContext.Departments
            .AsNoTracking()
            .Include(d => d.Hod)
            .OrderBy(d => d.DepartmentId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        var departments = departmentRows
            .Select(d => new DepartmentDto(
                d.DepartmentId,
                d.DepartmentId,
                d.DepartmentName,
                d.Hod?.EmployeeId ?? 0,
                d.Hod?.Email ?? string.Empty,
                d.Hod?.Email ?? string.Empty,
                string.Empty))
            .ToList();

        return new PaginatedResponse<DepartmentDto>(departments, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }

}
