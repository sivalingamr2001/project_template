using Microsoft.EntityFrameworkCore;
using Server.Features.Auth.User;
using Server.Features.Common;
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
                    e.DeptId,
                    e.UserRole,
                    e.Password,
                    // Project Department and HOD Details in one go
                    DeptInfo = e.Department != null ? new DepartmentDto(
                        e.Department.Id,
                        e.Department.DeptId,
                        e.Department.DeptName,
                        e.Department.DeptHodId,
                        // If current user is HOD, return "Self", else get HOD name
                        e.UserRole == RoleNames.Hod
                            ? "Self"
                            : (e.Department.HeadOfDepartment != null
                                ? BuildDisplayName(e.Department.HeadOfDepartment.FirstName, e.Department.HeadOfDepartment.LastName, e.Department.HeadOfDepartment.UserName)
                                : "N/A"),
                        e.Department.HeadOfDepartment != null ? e.Department.HeadOfDepartment.Email : string.Empty,
                        e.Department.HeadOfDepartment != null && e.Department.HeadOfDepartment.Mobile != null ? e.Department.HeadOfDepartment.Mobile : string.Empty
                    ) : null
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (user is null || !string.Equals(request.Password, user.Password, StringComparison.Ordinal))
            {
                return null;
            }

            // 1. Prepare User Display Info
            var displayName = BuildDisplayName(user.FirstName, user.LastName, user.UserName);
            var role = string.IsNullOrWhiteSpace(user.UserRole) ? "User" : user.UserRole;

            // 2. Prepare HOD Specific DTO for the Session
            // If user is HOD, we still provide their own dept info but flag HodName as Self
            var sessionHodDto = user.DeptInfo != null
                ? new DepartmentDto(
                    user.DeptInfo.Id,
                    user.DeptInfo.DeptId,
                    user.DeptInfo.Name,
                    user.DeptInfo.HodId,
                    user.DeptInfo.HodName,
                    user.DeptInfo.Email,
                    user.DeptInfo.Phone)
                : null;

            // 3. Construct Response
            return new LoginResponse(
                new SessionDto(
                    new LoggedInUserDto(
                        user.UserId,
                        user.EmployeeId,
                        user.UserName,
                        displayName,
                        user.Email ?? string.Empty,
                        user.Mobile ?? string.Empty,
                        user.DeptId ?? 0,
                        user.DeptInfo?.Name ?? "N/A",
                        role,
                        sessionHodDto
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





