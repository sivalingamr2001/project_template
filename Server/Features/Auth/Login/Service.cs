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
        // 1. Validate Credentials via Dapper using the Primary Connection
        var externalUser = await GetExternalUserAsync(request, ct);
        if (externalUser == null) return null;

        // 2. Fetch Department details using EF Core
        var department = await dbContext.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DepartmentId == externalUser.DeptId, ct);

        // 3. Fetch HOD Employee details using the HodId from the department
        EmployeeEntity? hodEmployee = null;
        if (department?.HodId > 0)
        {
            hodEmployee = await dbContext.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmployeeId == department.HodId, ct);
        }

        return MapToLoginResponse(externalUser, department, hodEmployee);
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
