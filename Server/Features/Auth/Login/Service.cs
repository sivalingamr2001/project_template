using Microsoft.EntityFrameworkCore;
using Server.Features.Auth.User;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;

namespace Server.Features.Auth.Login;

public sealed class LoginService(
    AppDbContext dbContext)
{
    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.Identifier?.Trim();
        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        var query = dbContext.Employees.AsNoTracking();
        if (int.TryParse(identifier, out var employeeId))
        {
            query = query.Where(employee => employee.EmployeeId == employeeId);
        }
        else
        {
            query = query.Where(employee => employee.UserName == identifier);
        }

        LoginUserProjection? user;

        try
        {
            user = await query
                .Where(e => e.Password == request.Password)
                .Select(employee => new LoginUserProjection(
                    employee.EmployeeId,
                    employee.UserName ?? string.Empty,
                    employee.Email ?? string.Empty,
                    employee.DeptId ?? 0,
                    employee.DeptName ?? "N/A",
                    employee.UserRole ?? "User",
                    employee.HodId ?? 0,
                    employee.HodName ?? string.Empty,
                    employee.HodEmail ?? string.Empty))
                .SingleOrDefaultAsync(cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            // Thrown if SingleOrDefault finds more than one matching record
            throw new Exception($"Authentication failed: Multiple records found for {identifier}.", ex);
        }
        catch (Exception ex)
        {
            // Thrown for DB connection issues or mapping errors
            throw new Exception($"Database error during authentication: {ex.Message}", ex);
        }

        if (user is null)
        {
            return null;
        }

        return new LoginResponse(
           new SessionDto(
               new LoggedInUserDto(
                   user.EmployeeId,
                   user.Name,
                   user.Email,
                   user.DeptId ?? 0,
                   user.DepartmentName,
                   user.Role,
                   user.HodID ?? 0,
                   user.HodName,
                   user.HodEmail)));
    }

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
                    .Select(h => new User.HodDto(h.EmployeeId, h.UserName, h.Email))
                    .FirstOrDefault()))
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
                    .Select(h => new User.HodDto(h.EmployeeId, h.UserName, h.Email))
                    .FirstOrDefault()))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private sealed record LoginUserProjection(
          int EmployeeId,
          string Name,
          string Email,
          int? DeptId,
          string DepartmentName,
          string Role,
          int? HodID,
          string HodName,
          string HodEmail);
}
