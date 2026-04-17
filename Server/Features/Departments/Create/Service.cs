using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Features.Common;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;

namespace Server.Features.Departments.Create;

public sealed class CreateDepartmentService(AppDbContext dbContext)
{
    public async Task<DepartmentDto> CreateAsync(
        CreateDepartmentRequest request,
        CancellationToken cancellationToken)
    {
        if (request.DeptId <= 0)
        {
            throw new InvalidOperationException("Department Id must be a positive number.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Department name is required.");
        }

        if (request.HodId <= 0)
        {
            throw new InvalidOperationException("HOD Id must be a positive number.");
        }

        var alreadyExists = await dbContext.Departments
            .AsNoTracking()
            .AnyAsync(d => d.DeptId == request.DeptId, cancellationToken);

        if (alreadyExists)
        {
            throw new InvalidOperationException($"Department '{request.DeptId}' already exists.");
        }

        var hodExists = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.EmployeeId == request.HodId && e.UserRole == RoleNames.Hod, cancellationToken);

        if (!hodExists)
        {
            throw new InvalidOperationException($"HOD with Id '{request.HodId}' does not exist or is not a HOD.");
        }

        var entity = new DepartmentEntity
        {
            DeptId = request.DeptId,
            DeptName = request.Name.Trim(),
            DeptHodId = request.HodId,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = "0",
            UpdatedOn = DateTime.UtcNow,
            ModifiedBy = null,
        };

        await dbContext.Departments.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var hodName = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == request.HodId)
            .Select(e => GetDisplayName(e.FirstName, e.LastName, e.UserName))
            .FirstOrDefaultAsync(cancellationToken) ?? string.Empty;

        return new DepartmentDto(
            entity.Id,
            entity.DeptId,
            entity.DeptName,
            entity.DeptHodId,
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
