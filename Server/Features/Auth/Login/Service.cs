using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

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
            logger.LogWarning("Login attempt with empty identifier or password");
            return null;
        }

        // 1. Authenticate against CMPL (source of truth for identity)
        var cmplUser = await GetCmplUserAsync(identifier, request.Password, ct);
        if (cmplUser == null)
        {
            logger.LogWarning("CMPL authentication failed for identifier: {Identifier}", identifier);
            return null;
        }

        // 2. Ensure local authorization record exists (source of truth for roles/permissions)
        var localUser = await EnsureLocalUserAsync(cmplUser, ct);
        if (localUser == null)
        {
            logger.LogError("Failed to create or retrieve local user for CMPL user_id {UserId}", cmplUser.UserId);
            return null;
        }

        // 3. Sync link fields if CMPL data changed
        await SyncLocalUserAsync(localUser, cmplUser, ct);

        // 4. Build enriched response with department data
        return await BuildLoginResponseAsync(cmplUser, localUser, ct);
    }

    private async Task<CmplUserRecord?> GetCmplUserAsync(string identifier, string password, CancellationToken ct)
    {
        var connectionString = configuration.GetConnectionString("MySqlConnectionString_Cmpl")
            ?? configuration["Database:MySqlConnectionString_Cmpl"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            logger.LogError("CMPL connection string is not configured");
            return null;
        }

        try
        {
            using var connection = new MySqlConnection(connectionString);
            await connection.OpenAsync(ct);

            return await connection.QueryFirstOrDefaultAsync<CmplUserRecord>(
                new CommandDefinition(
                    Queries.CmplLoginUserQuery,
                    new { id = identifier, pwd = password },
                    cancellationToken: ct));
        }
        catch (MySqlException ex)
        {
            logger.LogError(ex, "CMPL database connection/query failed for identifier: {Identifier}", identifier);
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during CMPL authentication");
            return null;
        }
    }

    private async Task<EmployeeEntity?> EnsureLocalUserAsync(CmplUserRecord cmplUser, CancellationToken ct)
    {
        // Fast path: user already exists
        var existing = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.UserId == cmplUser.UserId, ct);

        if (existing != null) return existing;

        // Slow path: create new user (handle race condition)
        var newUser = new EmployeeEntity
        {
            UserId = cmplUser.UserId,
            UserRole = UserRole.User,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            UpdatedOn = DateTime.UtcNow,
        };

        dbContext.Employees.Add(newUser);

        try
        {
            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation(
                "Auto-created local user for CMPL user_id {UserId} with default role {Role}",
                cmplUser.UserId, UserRole.User);
            return newUser;
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            // Race condition: another request created the user first
            logger.LogInformation(
                "Race condition detected for CMPL user_id {UserId}. Fetching existing record.",
                cmplUser.UserId);

            return await dbContext.Employees
                .FirstOrDefaultAsync(e => e.UserId == cmplUser.UserId, ct);
        }
        catch (DbUpdateException ex)
        {
            logger.LogError(ex, "Failed to create local user for CMPL user_id {UserId}", cmplUser.UserId);
            return null;
        }
    }

    private async Task SyncLocalUserAsync(EmployeeEntity localUser, CmplUserRecord cmplUser, CancellationToken ct)
    {
        // No longer syncing Email/EmployeeId as they are not stored in local EmployeeEntity
        // These are maintained only in CMPL database
        await Task.CompletedTask;
    }

    private async Task<LoginResponse> BuildLoginResponseAsync(
        CmplUserRecord cmpl,
        EmployeeEntity local,
        CancellationToken ct)
    {
        var role = local.UserRole ?? UserRole.User;
        var isActive = local.IsActive;

        // Fetch department data from local DB
        var deptDto = await GetDepartmentDataAsync(cmpl.DeptId, ct);

        var sessionUser = new LoggedInUserDto
        {
            UserId = local.UserId,
            EmployeeId = cmpl.EmployeeId,
            UserName = cmpl.UserName,
            Email = cmpl.Email ?? string.Empty,
            Mobile = cmpl.Mobile,
            DepartmentId = cmpl.DeptId,
            Name = cmpl.UserName, // Or combine first/last if available
            IsActive = isActive,
            CreatedOn = local.CreatedOn,
            UpdatedOn = local.UpdatedOn,
            DepartmentName = deptDto?.DepartmentName ?? "N/A",
            Role = role.ToString(),
            DepartmentHod = deptDto?.Hod,
            Department = deptDto
        };

        return new LoginResponse(new SessionDto(sessionUser));
    }

    private async Task<SessionDepartmentDto?> GetDepartmentDataAsync(int deptId, CancellationToken ct)
    {
        var dept = await dbContext.Departments
            .AsNoTracking()
            .Include(d => d.Hod)
            .FirstOrDefaultAsync(d => d.DepartmentId == deptId && d.IsActive, ct);

        if (dept == null) return null;

        HODDetailsDto? hodDto = null;
        if (dept.Hod != null)
        {
            hodDto = new HODDetailsDto(
                dept.Hod.UserId,
                "N/A",
                "N/A",
                "N/A");
        }

        return new SessionDepartmentDto(dept.DepartmentId, dept.DepartmentName, hodDto);
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        // MySQL: Error 1062 = duplicate entry
        return ex.InnerException is MySqlException mysqlEx && mysqlEx.Number == 1062;
    }

    public record CmplUserRecord
    {
        public int UserId { get; init; }
        public string EmployeeId { get; init; } = string.Empty;
        public string UserName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public long Mobile { get; init; }
        public int DeptId { get; init; }
    }
}
