using Microsoft.EntityFrameworkCore;
using Server.Domain.Enums;
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
            .FirstOrDefaultAsync(d => d.DepartmentId == deptId, cancellationToken);

        if (department is null)
        {
            return null;
        }

        var currentHodEmployeeId = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.UserId == department.HodId)
            .Select(e => (int?)e.EmployeeId)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentHodEmployeeId != request.HodId)
        {
            var hodEmployee = await dbContext.Employees
                .AsNoTracking()
                .Where(e => e.EmployeeId == request.HodId && e.UserRole == UserRole.Hod)
                .Select(e => new { e.UserId, e.EmployeeId })
                .FirstOrDefaultAsync(cancellationToken);

            if (hodEmployee is null)
            {
                throw new InvalidOperationException($"HOD with Id '{request.HodId}' does not exist or is not a HOD.");
            }

            department.HodId = hodEmployee.UserId;
        }

        department.DepartmentName = request.Name.Trim();
        department.UpdatedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var hodName = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.UserId == department.HodId)
            .Select(e => new
            {
                e.EmployeeId,
                e.FirstName,
                e.LastName,
                e.UserName
            })
            .FirstOrDefaultAsync(cancellationToken);

        return new DepartmentDto(
            department.DepartmentId,
            department.DepartmentId,
            department.DepartmentName,
            hodName?.EmployeeId ?? 0,
            hodName is null ? string.Empty : GetDisplayName(hodName.FirstName, hodName.LastName, hodName.UserName),
            string.Empty,
            string.Empty);
    }

    private static string GetDisplayName(string? firstName, string? lastName, string userName)
    {
        var combined = $"{firstName ?? string.Empty} {lastName ?? string.Empty}".Trim();
        return !string.IsNullOrWhiteSpace(combined) ? combined : userName;
    }
}
