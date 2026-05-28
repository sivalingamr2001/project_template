using Microsoft.EntityFrameworkCore;
using Server.Domain.Enums;
using Server.Features.Common;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Departments.Update;

public sealed class UpdateDepartmentService(AppDbContext dbContext)
{
    public async Task<DepartmentDto?> UpdateAsync(
        int deptId,
        UpdateDepartmentRequest request,
        CancellationToken cancellationToken)
    {
        // 1. Validate Input Data Arguments
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

        // 2. Fetch the Department alongside its current HOD details in a single query
        var department = await dbContext.Departments
            .Include(d => d.Hod)
            .FirstOrDefaultAsync(d => d.DepartmentId == deptId, cancellationToken);

        if (department is null)
        {
            return null;
        }

        // 3. Process HOD assignment changes if the ID is different
        if (department.HodId != request.HodId)
        {
            var newHod = await dbContext.Employees
                .AsNoTracking()
                .Where(e => e.UserId == request.HodId && (e.UserRole ?? UserRole.User) == UserRole.Hod)
                .FirstOrDefaultAsync(cancellationToken);

            if (newHod is null)
            {
                throw new InvalidOperationException($"HOD with UserId '{request.HodId}' does not exist or does not possess the HOD role.");
            }

            // FIX: Explicitly cast the nullable int? UserId to int to match department.HodId
            department.HodId = (int)newHod.UserId;
            department.Hod = newHod;
        }

        // 4. Mutate local field values and commit state changes
        department.DepartmentName = request.Name.Trim();
        department.UpdatedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        // 5. FIX: Match the exact database property names from your EmployeeEntity schema
        return new DepartmentDto
        {
            DepartmentId = department.DepartmentId,
            DepartmentName = department.DepartmentName,
            HodId = department.HodId ?? 0,
            HOD = department.Hod != null ? new HodDto
            {
                HodName = string.Empty,
                HodEmail = string.Empty,
                HodEmployeeId = string.Empty
            } : null
        };
    }
}
