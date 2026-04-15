using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

namespace Server.Features.Auth.User;

public sealed class UserService(AppDbContext dbContext)
{
    public async Task<UserListResponse> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        var users = await dbContext.Employees
            .AsNoTracking()
            .Select(e => new UserDto(
                e.EmployeeId,
                e.UserName,
                e.Email,
                e.Mobile,
                e.DeptId ?? 0,
                e.DeptName,
                e.UserRole,
                dbContext.Employees
                    .Where(h => h.DeptId == e.DeptId && h.UserRole == RoleNames.Hod)
                    .Select(h => new HodDto(h.EmployeeId, h.UserName, h.Email))
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
                e.UserName,
                e.Email,
                e.Mobile,
                e.DeptId ?? 0,
                e.DeptName,
                e.UserRole,
                dbContext.Employees
                    .Where(h => h.DeptId == e.DeptId && h.UserRole == RoleNames.Hod)
                    .Select(h => new HodDto(h.EmployeeId, h.UserName, h.Email))
                    .FirstOrDefault()
            ))
            .SingleOrDefaultAsync(cancellationToken);
    }
}
