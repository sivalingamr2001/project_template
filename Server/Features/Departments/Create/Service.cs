using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Domain.Enums;
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
            .AnyAsync(d => d.DepartmentId == request.DeptId, cancellationToken);

        if (alreadyExists)
        {
            throw new InvalidOperationException($"Department '{request.DeptId}' already exists.");
        }

        var hodExists = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.UserId == request.HodId
                        && (e.UserRole ?? UserRole.User) == UserRole.Hod)
            .Select(e => new { e.UserId, e.EmployeeId, e.Email })
            .FirstOrDefaultAsync(cancellationToken);

        if (hodExists is null)
        {
            throw new InvalidOperationException($"HOD with UserId '{request.HodId}' does not exist or is not a HOD.");
        }

        var entity = new DepartmentEntity
        {
            DepartmentId = request.DeptId,
            DepartmentName = request.Name.Trim(),
            HodId = hodExists.UserId,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = "0",
            UpdatedOn = DateTime.UtcNow,
            ModifiedBy = null,
        };

        await dbContext.Departments.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new DepartmentDto
        {
            DepartmentId = entity.DepartmentId,
            Name = entity.DepartmentName,
            HodId = hodExists.UserId,
            HodName = hodExists.Email,
            HodEmail = hodExists.Email,
            HodEmployeeId = hodExists.EmployeeId
        };
    }
}
