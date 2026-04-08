using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;

namespace Server.Features.Auth.User;

public sealed class UserService(AppDbContext dbContext)
{
    public async Task<UserListResponse> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        var users = await dbContext.Employees
            .AsNoTracking()
            .Select(e => new UserDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Phone, // Ensure this exists in your Entity
                e.DepartmentId,
                e.DepartmentName,
                e.Role,
                dbContext.Employees
                    .Where(h => h.DepartmentId == e.DepartmentId && h.Role == "Hod")
                    .Select(h => new HodDto(h.EmployeeId, h.Name, h.Email))
                    .FirstOrDefault()
            ))
            .ToListAsync(cancellationToken);

        return new UserListResponse(users);
    }

    public async Task<UserDto?> GetUserByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .Select(e => new UserDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Phone,
                e.DepartmentId,
                e.DepartmentName,
                e.Role,
                dbContext.Employees
                    .Where(h => h.DepartmentId == e.DepartmentId && h.Role == "Hod")
                    .Select(h => new HodDto(h.EmployeeId, h.Name, h.Email))
                    .FirstOrDefault()
            ))
            .SingleOrDefaultAsync(cancellationToken);
    }
}
