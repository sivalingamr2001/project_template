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
                   user.Name ?? string.Empty,
                   user.Email ?? string.Empty,
                   user.DeptId ?? 0,
                   user.DepartmentName ?? "N/A",
                   user.Role ?? "User",
                   user.HodID ?? 0,
                   user.HodName ?? string.Empty,
                   user.HodEmail ?? string.Empty)));
    }

    private sealed record LoginUserProjection(
          int EmployeeId,
          string? Name,
          string? Email,
          int? DeptId,
          string? DepartmentName,
          string? Role,
          int? HodID,
          string? HodName,
          string? HodEmail);
}
