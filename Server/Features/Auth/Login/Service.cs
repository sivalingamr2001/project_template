using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Db;

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
            return null;

        // 1. Validate against CMPL DB (Source of Truth for Identity)
        var cmplUser = await GetCmplUserAsync(identifier, request.Password, ct);
        if (cmplUser == null)
        {
            logger.LogWarning("Authentication failed for identifier: {Identifier}", identifier);

            // Add await here
            var user = await ExecuteOldLoginLogicAsync(identifier, request.Password, ct);

            return user;
        }

        // 2. Fetch/Enrich with Local DB Data (Source of Truth for App Metadata)
        // We use UserId (CMPL_USER_ID) as the primary link
        var localUser = await dbContext.Employees
            .AsNoTracking()
            .Include(e => e.Department)
                .ThenInclude(d => d!.Hod)
            .FirstOrDefaultAsync(e => e.UserId == cmplUser.UserId, ct);

        // 3. Construct Unified Response
        return MapToLoginResponse(cmplUser, localUser);
    }

    private async Task<CmplUserRecord?> GetCmplUserAsync(string identifier, string password, CancellationToken ct)
    {
        var connectionString = configuration["Database:MySqlConnectionString_Cmpl"];

        // CMPL DB Logic: Support login via UserName, EmpId, or Email
        const string sql = @"
            SELECT 
                CMPL_USER_ID as UserId, 
                emp_id as EmployeeId, 
                CMPL_USER_NAME as UserName, 
                MAIL_ID as Email,
                MOB_NO as Mobile
            FROM it_inventory_db_new.jan_complaint_login
            WHERE deleted_flag = 0 
              AND (CMPL_USER_NAME = @id OR emp_id = @id OR MAIL_ID = @id) 
              AND CMPL_USER_KEY = @pwd 
            LIMIT 1";

        try
        {
            using var connection = new MySqlConnection(connectionString);
            return await connection.QueryFirstOrDefaultAsync<CmplUserRecord>(
                new CommandDefinition(sql, new { id = identifier, pwd = password }, cancellationToken: ct));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "CMPL Database connection failed.");
            return null;
        }
    }

    private LoginResponse MapToLoginResponse(CmplUserRecord cmpl, EmployeeEntity? local)
    {
        // Use Local DB role/dept if available, otherwise defaults
        var role = local?.UserRole ?? UserRole.User;
        var deptId = local?.DeptId ?? 0;
        var deptName = local?.Department?.DepartmentName ?? "N/A";

        // Handle HOD logic
        HODDetailsDto? hodDto = null;
        if (local?.Department?.Hod != null)
        {
            var hod = local.Department.Hod;
            var isSelf = (role == UserRole.Hod && hod.EmployeeId == local.EmployeeId);

            hodDto = new HODDetailsDto(
                hod.EmployeeId,
                isSelf ? "Self" : BuildDisplayName(hod.FirstName, hod.LastName, hod.UserName),
                hod.Email ?? string.Empty,
                hod.Mobile ?? string.Empty
            );
        }

        var deptDto = new SessionDepartmentDto(deptId, deptName, hodDto);

        var displayName = local != null
            ? BuildDisplayName(local.FirstName, local.LastName, local.UserName)
            : cmpl.UserName;

        var sessionUser = new LoggedInUserDto(
            cmpl.UserId,
            cmpl.EmployeeId,
            cmpl.UserName,
            local?.FirstName ?? cmpl.UserName,
            local?.LastName ?? string.Empty,
            displayName,
            cmpl.Email ?? string.Empty,
            cmpl.Mobile ?? string.Empty,
            cmpl.Mobile ?? string.Empty,
            local?.Location ?? "Unknown",
            local?.IsActive ?? true,
            local?.CreatedOn ?? DateTime.Now,
            local?.UpdatedOn ?? DateTime.Now,
            deptId,
            deptName,
            role.ToString(),
            hodDto,
            deptDto
        );

        return new LoginResponse(new SessionDto(sessionUser));
    }

    private static string BuildDisplayName(string? first, string? last, string user)
    {
        var full = $"{first ?? ""} {last ?? ""}".Trim();
        return string.IsNullOrWhiteSpace(full) ? user : full;
    }

    // Lightweight record for Dapper mapping
    private record CmplUserRecord(int UserId, int EmployeeId, string UserName, string Email, string Mobile);

    private async Task<LoginResponse?> ExecuteOldLoginLogicAsync(string identifier, string password, CancellationToken ct)
    {
        var query = dbContext.Employees.AsNoTracking();
        if (int.TryParse(identifier, out var numericIdentifier))
        {
            query = query.Where(e =>
                e.UserId == numericIdentifier ||
                e.EmployeeId == numericIdentifier);
        }
        else
        {
            query = query.Where(e =>
                e.UserName == identifier ||
                e.Email == identifier);
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
        var role = user.UserRole.ToString();

        var sessionHodDto = user.Department?.Hod == null ? null : new HODDetailsDto(
             user.Department.Hod.EmployeeId,
             // Fix for Arguments 1 & 2: Compare Enum directly
             (user.UserRole == UserRole.Hod && user.Department.Hod.EmployeeId == user.EmployeeId)
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
}
