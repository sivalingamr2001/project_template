using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

namespace Server.Features.Auth.User;

public sealed class UserService(AppDbContext dbContext)
{
    public async Task<UserListResponse> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        try
        {
            var users = await dbContext.Employees
                .AsNoTracking()
                .Select(e => new UserDto(
                    e.EmployeeId,
                    e.FirstName ?? string.Empty,
                    e.LastName ?? string.Empty,
                    e.UserName ?? string.Empty, // Add ?? here
                    e.Mobile ?? string.Empty,   // Add ?? here
                    e.Location ?? string.Empty, // Add ?? here
                    e.Email ?? string.Empty,
                    e.DeptId,
                    e.DeptName ?? string.Empty,
                    e.UserRole ?? string.Empty,
                    e.HodId ?? 0,
                    e.HodName ?? string.Empty,
                    e.HodEmail ?? string.Empty
                ))
                .ToListAsync(cancellationToken);

            return new UserListResponse(users);
        }
        catch (OperationCanceledException)
        {
            // Handle or rethrow if the request was timed out or cancelled
            throw;
        }
        catch (Exception ex)
        {
            // Log the exception here (e.g., _logger.LogError(ex, "Failed to fetch users"))
            throw new Exception("An error occurred while retrieving users.", ex);
        }
    }
    

    public async Task<UserDto?> GetUserByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .Select(e => new UserDto(
                 e.EmployeeId,
                e.FirstName ?? string.Empty,
                e.LastName ?? string.Empty,
                e.UserName,
                e.Mobile,
                e.Location,
                e.Email ?? string.Empty,
                e.DeptId,
                e.DeptName ?? string.Empty,
                e.UserRole ?? string.Empty,
                e.HodId ?? 0,      // Maps to HodEmployeeId
                e.HodName ?? string.Empty,
                e.HodEmail ?? string.Empty
            ))
            .SingleOrDefaultAsync(cancellationToken);
    }
}
