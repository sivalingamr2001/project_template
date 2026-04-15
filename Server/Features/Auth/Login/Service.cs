using Microsoft.EntityFrameworkCore;
using Server.Features.Auth.User;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

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
                .Select(employee => new LoginUserProjection(
                    employee.UserId,
                    employee.EmployeeId,
                    employee.FirstName,
                    employee.LastName,
                    employee.UserName,
                    employee.Email,
                    employee.Mobile,
                    employee.DeptId,
                    employee.DeptName,
                    employee.UserRole,
                    employee.HodId,
                    employee.HodName,
                    employee.HodEmail,
                    employee.Password))
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

        if (!string.Equals(request.Password, user.Password, StringComparison.Ordinal))
        {
            return null;
        }

        var name = BuildDisplayName(user.FirstName, user.LastName, user.UserName);
        var departmentName = string.IsNullOrWhiteSpace(user.DepartmentName) ? "N/A" : user.DepartmentName!;
        var role = string.IsNullOrWhiteSpace(user.Role) ? "User" : user.Role!;

        return new LoginResponse(
           new SessionDto(
               new LoggedInUserDto(
                   user.UserId,
                   user.EmployeeId,
                   user.UserName,
                   name,
                   user.Email ?? string.Empty,
                   user.Phone ?? string.Empty,
                   user.DeptId ?? 0,
                   departmentName,
                   role,
                   new DepartmentHodDto(
                       user.HodID ?? 0,
                       user.HodName ?? string.Empty,
                       user.HodEmail ?? string.Empty))));
    }

    private sealed record LoginUserProjection(
          int UserId,
          int EmployeeId,
          string? FirstName,
          string? LastName,
          string UserName,
          string? Email,
          string? Phone,
          int? DeptId,
          string? DepartmentName,
          string? Role,
          int? HodID,
          string? HodName,
          string? HodEmail,
          string Password);

    private static string BuildDisplayName(string? firstName, string? lastName, string userName)
    {
        var combined = $"{firstName ?? string.Empty} {lastName ?? string.Empty}".Trim();
        if (!string.IsNullOrWhiteSpace(combined))
        {
            return combined;
        }

        return userName;
    }
}





