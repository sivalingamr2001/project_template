using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Features.Common;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;

namespace Server.Features.Departments.Update;

public sealed class UpdateDepartmentService(AppDbContext dbContext)
{
    public async Task<DepartmentDto?> UpdateAsync(
        int deptId,
        UpdateDepartmentRequest request,
        CancellationToken cancellationToken)
    {
        if (deptId <= 0)
        {
            throw new InvalidOperationException("Department ID must be a positive number.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Department name is required.");
        }

        if (request.HodId <= 0)
        {
            throw new InvalidOperationException("HOD Id must be a positive number.");
        }

        var department = await dbContext.Departments
            .FirstOrDefaultAsync(d => d.DeptId == deptId, cancellationToken);

        if (department is null)
        {
            return null;
        }

        if (department.DeptHodId != request.HodId)
        {
            var hodExists = await dbContext.Employees
                .AsNoTracking()
                .AnyAsync(e => e.EmployeeId == request.HodId && e.UserRole == RoleNames.Hod, cancellationToken);

            if (!hodExists)
            {
                throw new InvalidOperationException($"HOD with Id '{request.HodId}' does not exist or is not a HOD.");
            }

            department.DeptHodId = request.HodId;
        }

        department.DeptName = request.Name.Trim();
        department.UpdatedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var hodName = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == department.DeptHodId)
            .Select(e => GetDisplayName(e.FirstName, e.LastName, e.UserName))
            .FirstOrDefaultAsync(cancellationToken) ?? string.Empty;

        return new DepartmentDto(
            department.Id,
            department.DeptId,
            department.DeptName,
            department.DeptHodId,
            hodName,
            string.Empty,
            string.Empty);
    }

    private static string GetDisplayName(string? firstName, string? lastName, string userName)
    {
        var combined = $"{firstName ?? string.Empty} {lastName ?? string.Empty}".Trim();
        return !string.IsNullOrWhiteSpace(combined) ? combined : userName;
    }
}
