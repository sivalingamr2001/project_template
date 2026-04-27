using Microsoft.EntityFrameworkCore;
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
            query = query.Where(e => e.EmployeeId == employeeId);
        }
        else
        {
            query = query.Where(e => e.UserName == identifier);
        }

        try
        {
            var user = await query
                .Select(e => new
                {
                    e.UserId,
                    e.EmployeeId,
                    e.FirstName,
                    e.LastName,
                    e.UserName,
                    e.Email,
                    e.Mobile,
                    e.Location,
                    e.IsActive,
                    e.CreatedOn,
                    e.UpdatedOn,
                    e.DeptId,
                    e.UserRole,
                    e.Password,
                    Department = e.Department == null
                        ? null
                        : new
                        {
                            e.Department.DepartmentId,
                            e.Department.DepartmentName,
                            Hod = e.Department.Hod == null
                                ? null
                                : new
                                {
                                    e.Department.Hod.EmployeeId,
                                    e.Department.Hod.FirstName,
                                    e.Department.Hod.LastName,
                                    e.Department.Hod.UserName,
                                    e.Department.Hod.Email,
                                    e.Department.Hod.Mobile
                                }
                        }
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (user is null || !string.Equals(request.Password, user.Password, StringComparison.Ordinal))
            {
                return null;
            }

            // 1. Prepare User Display Info
            var displayName = BuildDisplayName(user.FirstName, user.LastName, user.UserName);
            var role = string.IsNullOrWhiteSpace(user.UserRole) ? "User" : user.UserRole;

            var sessionHodDto = user.Department?.Hod == null
                ? null
                : new HODDetailsDto(
                    user.Department.Hod.EmployeeId,
                    string.Equals(user.UserRole, RoleNames.Hod, StringComparison.OrdinalIgnoreCase)
                        && user.Department.Hod.EmployeeId == user.EmployeeId
                        ? "Self"
                        : BuildDisplayName(
                            user.Department.Hod.FirstName,
                            user.Department.Hod.LastName,
                            user.Department.Hod.UserName),
                    user.Department.Hod.Email ?? string.Empty,
                    user.Department.Hod.Mobile ?? string.Empty);

            var sessionDepartment = user.Department == null
                ? null
                : new SessionDepartmentDto(
                    user.Department.DepartmentId,
                    user.Department.DepartmentName,
                    sessionHodDto);

            return new LoginResponse(
                new SessionDto(
                    new LoggedInUserDto(
                        user.UserId,
                        user.EmployeeId,
                        user.UserName,
                        user.FirstName ?? string.Empty,
                        user.LastName ?? string.Empty,
                        displayName,
                        user.Email ?? string.Empty,
                        user.Mobile ?? string.Empty,
                        user.Mobile ?? string.Empty,
                        user.Location ?? string.Empty,
                        user.IsActive,
                        user.CreatedOn,
                        user.UpdatedOn,
                        user.DeptId ?? 0,
                        user.Department?.DepartmentName ?? "N/A",
                        role,
                        sessionHodDto,
                        sessionDepartment
                    )
                )
            );
        }
        catch (InvalidOperationException ex)
        {
            throw new Exception($"Authentication failed: Duplicate records for {identifier}.", ex);
        }
        catch (Exception ex)
        {
            throw new Exception($"Database error: {ex.Message}", ex);
        }
    }

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


