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

        // Authenticate ONLY against CMPL DB (source of truth for identity + profile).
        var cmplUser = await GetCmplUserAsync(identifier, request.Password, ct);
        if (cmplUser == null)
        {
            logger.LogWarning("Authentication failed for identifier: {Identifier}", identifier);
            return null;
        }

        // Local DB is source of truth ONLY for app authorization metadata (role/isActive).
        // Use UserId (CMPL_USER_ID) as the primary link.
        var localUser = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == cmplUser.UserId, ct);
        if (localUser == null)
        {
            localUser = new EmployeeEntity
            {
                UserId = cmplUser.UserId,
                EmployeeId = cmplUser.EmployeeId,
                Email = cmplUser.Email,
                UserRole = UserRole.User,
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
            };

            dbContext.Employees.Add(localUser);
            try
            {
                await dbContext.SaveChangesAsync(ct);
                logger.LogInformation(
                    "Auto-created local authorization user for CMPL user_id {UserId} (employee_id {EmployeeId}) with default role {Role}.",
                    localUser.UserId,
                    localUser.EmployeeId,
                    localUser.UserRole);
            }
            catch (DbUpdateException ex)
            {
                // Likely concurrent login created the row first; fetch it and continue.
                logger.LogWarning(
                    ex,
                    "Local authorization user auto-create raced for CMPL user_id {UserId}. Fetching existing record.",
                    cmplUser.UserId);
                localUser = await dbContext.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == cmplUser.UserId, ct);
            }
        }
        else
        {
            // Keep the two "link" fields in sync with CMPL (still no passwords/profile persistence locally).
            var changed = false;
            if (localUser.EmployeeId != cmplUser.EmployeeId)
            {
                localUser.EmployeeId = cmplUser.EmployeeId;
                changed = true;
            }
            if (!string.Equals(localUser.Email, cmplUser.Email, StringComparison.OrdinalIgnoreCase))
            {
                localUser.Email = cmplUser.Email;
                changed = true;
            }
            if (changed)
            {
                localUser.UpdatedOn = DateTime.UtcNow;
                await dbContext.SaveChangesAsync(ct);
            }
        }

        // Construct response preserving the existing contract, but sourcing data correctly.
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
                MOB_NO as Mobile,
                dept_id as DeptId
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
        // Authorization fields come from local DB.
        var role = local?.UserRole ?? UserRole.User;
        var isActive = local?.IsActive ?? true;
        var createdOn = local?.CreatedOn ?? DateTime.UtcNow;
        var updatedOn = local?.UpdatedOn ?? DateTime.UtcNow;

        // Profile fields come from CMPL DB.
        var displayName = cmpl.UserName;
        var deptId = cmpl.DeptId;
        const string deptName = "N/A";
        HODDetailsDto? hodDto = null;
        var deptDto = new SessionDepartmentDto(deptId, deptName, hodDto);

        var sessionUser = new LoggedInUserDto(
            cmpl.UserId,
            cmpl.EmployeeId,
            cmpl.UserName,
            cmpl.UserName,
            string.Empty,
            displayName,
            cmpl.Email ?? string.Empty,
            cmpl.Mobile ?? string.Empty,
            cmpl.Mobile ?? string.Empty,
            "Unknown",
            isActive,
            createdOn,
            updatedOn,
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
    private record CmplUserRecord(int UserId, int EmployeeId, string UserName, string Email, string Mobile, int DeptId);

    [Obsolete("Deprecated: CMPL DB is the source of truth for authentication. TODO: remove ExecuteOldLoginLogicAsync once legacy users are migrated.")]
    private async Task<LoginResponse?> ExecuteOldLoginLogicAsync(string identifier, string password, CancellationToken ct)
    {
        // TODO: Remove this method after legacy local-login support is fully retired.
        // This is intentionally disabled because local DB no longer stores passwords/profile data.
        _ = identifier;
        _ = password;
        _ = ct;
        return await Task.FromResult<LoginResponse?>(null);
    }
}
