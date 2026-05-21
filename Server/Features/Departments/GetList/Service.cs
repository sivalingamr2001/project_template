using Microsoft.EntityFrameworkCore;
using Server.Features.Common;
using Server.Features.HOD;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Departments.GetList;

public sealed class GetDepartmentsService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<DepartmentDto>> GetAsync(
        GetDepartmentQuery query,
        CancellationToken cancellationToken)
    {
        var departmentsQuery = dbContext.Departments
            .AsNoTracking()
            .Include(dept => dept.Hod)
            .OrderBy(dept => dept.DepartmentId);

        var totalCount = await departmentsQuery.CountAsync(cancellationToken);

        var items = await departmentsQuery
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(dept => new DepartmentDto
            {
                DepartmentId = dept.DepartmentId,
                Name = dept.DepartmentName,
                HodId = dept.HodId,
                HodName = dept.Hod != null ? dept.Hod.Email : string.Empty,
                HodEmail = dept.Hod != null ? dept.Hod.Email : string.Empty,
                HodEmployeeId = dept.Hod != null ? dept.Hod.EmployeeId : null
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<DepartmentDto>(
            items,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }
}
