using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Server.Domain.Entities;
using Server.Infrastructure.Db;
using Server.Shared.Constants;

namespace Server.Features.Auth.Login;

public sealed class LoginService(
    AppDbContext dbContext,
    IConfiguration configuration,
    ILogger<LoginService> logger)
{
    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken ct)
    {
        var identifier = request.Identifier?.Trim();
        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        // --- 1. TRY NEW METHOD (Dapper / External DB) ---
        try
        {
            var externalUser = await GetExternalUserAsync(request, ct);
            if (externalUser != null)
            {
                var department = await dbContext.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DepartmentId == externalUser.DeptId, ct);

                EmployeeEntity? hodEmployee = null;
                if (department?.HodId > 0)
                {
                    hodEmployee = await dbContext.Employees
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.EmployeeId == department.HodId, ct);
                }

                return MapToLoginResponse(externalUser, department, hodEmployee);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "New login method failed. Falling back to old method for {Identifier}", identifier);
        }

        // --- 2. FALLBACK TO OLD METHOD (EF Core / Internal DB) ---
        return await ExecuteOldLoginLogicAsync(identifier, request.Password, ct);
    }

    private async Task<LoginResponse?> ExecuteOldLoginLogicAsync(string identifier, string password, CancellationToken ct)
    {
        var query = dbContext.Employees.AsNoTracking();
        if (int.TryParse(identifier, out var employeeId))
        {
            query = query.Where(e => e.EmployeeId == employeeId);
        }
        else
        {
            query = query.Where(e => e.UserName == identifier);
        }

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
                Department = e.Department == null ? null : new
                {
                    e.Department.DepartmentId,
                    e.Department.DepartmentName,
                    Hod = e.Department.Hod == null ? null : new
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
            .SingleOrDefaultAsync(ct);

        if (user is null || !string.Equals(password, user.Password, StringComparison.Ordinal))
        {
            return null;
        }

        var displayName = BuildDisplayName(user.FirstName, user.LastName, user.UserName);
        var role = string.IsNullOrWhiteSpace(user.UserRole) ? "User" : user.UserRole;

        var sessionHodDto = user.Department?.Hod == null ? null : new HODDetailsDto(
            user.Department.Hod.EmployeeId,
            string.Equals(user.UserRole, RoleNames.Hod, StringComparison.OrdinalIgnoreCase) && user.Department.Hod.EmployeeId == user.EmployeeId
                ? "Self"
                : BuildDisplayName(user.Department.Hod.FirstName, user.Department.Hod.LastName, user.Department.Hod.UserName),
            user.Department.Hod.Email ?? string.Empty,
            user.Department.Hod.Mobile ?? string.Empty);

        var sessionDepartment = user.Department == null ? null : new SessionDepartmentDto(
            user.Department.DepartmentId, user.Department.DepartmentName, sessionHodDto);

        return new LoginResponse(new SessionDto(new LoggedInUserDto(
            user.UserId, user.EmployeeId, user.UserName, user.FirstName ?? string.Empty,
            user.LastName ?? string.Empty, displayName, user.Email ?? string.Empty,
            user.Mobile ?? string.Empty, user.Mobile ?? string.Empty, user.Location ?? string.Empty,
            user.IsActive, user.CreatedOn, user.UpdatedOn, user.DeptId ?? 0,
            user.Department?.DepartmentName ?? "N/A", role, sessionHodDto, sessionDepartment)));
    }

    private static string BuildDisplayName(string? firstName, string? lastName, string userName)
    {
        var combined = $"{firstName ?? string.Empty} {lastName ?? string.Empty}".Trim();
        return !string.IsNullOrWhiteSpace(combined) ? combined : userName;
    }


    private async Task<ExternalUserBrief?> GetExternalUserAsync(LoginRequest request, CancellationToken ct)
    {
        // Use the main connection string which has higher privileges
        var connectionString = configuration["Database:MySqlConnectionString_Cmpl"];
        var identifier = request.Identifier?.Trim();

        const string sql = @"
            SELECT CMPL_USER_ID as UserId, emp_id as EmployeeId, CMPL_USER_NAME as UserName, 
                   CMPL_USER_RIGHTS as Role, MOB_NO as Mobile, MAIL_ID as Email, DEPT_ID as DeptId
            FROM it_inventory_db_new.jan_complaint_login
            WHERE deleted_flag = 0 
              AND (CMPL_USER_NAME = @id OR emp_id = @id) 
              AND CMPL_USER_KEY = @pwd 
            LIMIT 1";

        try
        {
            using var connection = new MySqlConnection(connectionString);
            return await connection.QueryFirstOrDefaultAsync<ExternalUserBrief>(
                new CommandDefinition(sql, new { id = identifier, pwd = request.Password }, cancellationToken: ct));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Authentication query failed on primary connection.");
            return null;
        }
    }

    private LoginResponse MapToLoginResponse(ExternalUserBrief user, DepartmentEntity? dept, EmployeeEntity? hod)
    {
        var isSelf = string.Equals(user.Role, RoleNames.Hod, StringComparison.OrdinalIgnoreCase)
                     && user.EmployeeId == hod?.EmployeeId;

        var hodDto = hod == null ? null : new HODDetailsDto(
            hod.EmployeeId,
            isSelf ? "Self" : $"{hod.FirstName} {hod.LastName}".Trim(),
            hod.Email ?? string.Empty,
            hod.Mobile ?? string.Empty);

        var deptDto = new SessionDepartmentDto(
            dept?.DepartmentId ?? user.DeptId,
            dept?.DepartmentName ?? "N/A",
            hodDto);

        var sessionUser = new LoggedInUserDto(
            user.UserId,
            user.EmployeeId,
            user.UserName,
            user.UserName,
            string.Empty,
            user.UserName,
            user.Email ?? string.Empty,
            user.Mobile ?? string.Empty,
            user.Mobile ?? string.Empty,
            "N/A",
            true,
            DateTime.Now,
            DateTime.Now,
            user.DeptId,
            dept?.DepartmentName ?? "N/A",
            user.Role ?? "User",
            hodDto,
            deptDto
        );

        return new LoginResponse(new SessionDto(sessionUser));
    }

    private record ExternalUserBrief(int UserId, int EmployeeId, string UserName, string Role, string Mobile, string Email, int DeptId);
}
