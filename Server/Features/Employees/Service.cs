using System.Data;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MySqlConnector;
using Server.Domain.Enums;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Employees;

public sealed class EmployeeService(
    AppDbContext dbContext,
    ConnectionStrings connectionStrings,
    ILogger<EmployeeService> logger)
{
    // FIX: Assign directly without relying on .Value
    private readonly ConnectionStrings _connectionStrings = connectionStrings;

    public async Task<PaginatedResponse<UserResponse>> GetEmployeesAsync(
        GetEmployeesQuery query,
        CancellationToken cancellationToken)
    {
        var users = await GetUsersAsync(cancellationToken);
        var totalCount = users.Count;
        var data = users
            .OrderBy(user => user.UserId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToList();

        return new PaginatedResponse<UserResponse>(
            data,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }

    public async Task<List<UserResponse>> GetUsersAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var connection = new MySqlConnection(_connectionStrings.Cmpl);

            // 1. Fetch main target users from CMPL database
            var cmplUsersIterable = await connection.QueryAsync<CmplUserDto>(
                new CommandDefinition(Queries.CmplUserQuery, cancellationToken: cancellationToken));
            var cmplUsers = cmplUsersIterable.AsList();

            if (cmplUsers.Count == 0) return [];

            var userIds = cmplUsers.Select(u => u.UserId).Distinct().ToList();
            var departmentIds = cmplUsers.Select(u => u.DeptId).Distinct().ToList();

            // 2. Run DbContext queries sequentially (DbContext is not thread-safe for concurrent operations)
            var localUsers = (await dbContext.Employees
                .AsNoTracking()
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync(cancellationToken))
                .ToDictionary(u => u.UserId);

            var localDepartments = await dbContext.Departments
                .AsNoTracking()
                .Where(d => departmentIds.Contains(d.DepartmentId))
                .ToListAsync(cancellationToken);

            // Fetch HOD master data in parallel with the above (uses separate MySqlConnection)
            var rawHodsMasterList = await GetHodAsync(cancellationToken);

            // 3. Index the HOD Master list by EmployeeId for O(1) lookup speeds
            var hodMasterByEmployeeId = rawHodsMasterList
                .Where(h => !string.IsNullOrWhiteSpace(h.EmployeeId))
                .DistinctBy(h => h.EmployeeId, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(h => h.EmployeeId, h => h, StringComparer.OrdinalIgnoreCase);

            var departmentById = localDepartments.ToDictionary(d => d.DepartmentId);

            // 5. Build final responses
            var responses = new List<UserResponse>(cmplUsers.Count);
            foreach (var user in cmplUsers)
            {
                localUsers.TryGetValue(user.UserId, out var localUser);
                var role = localUser?.UserRole?.ToString();
                var location = localUser?.Location ?? string.Empty;

                var department = departmentById.TryGetValue(user.DeptId, out var dept)
                    ? new DepartmentResponse(dept.DepartmentId, dept.DepartmentName, dept.HodId)
                    : new DepartmentResponse(user.DeptId, string.Empty, null);

                HodResponse? hod = null;
                if (!string.IsNullOrWhiteSpace(user.EmployeeId))
                {
                    hodMasterByEmployeeId.TryGetValue(user.EmployeeId, out hod);
                }

                responses.Add(new UserResponse(
                    user.UserId,
                    user.EmployeeId,
                    user.UserName,
                    user.Email,
                    user.Mobile,
                    location,
                    role,
                    department,
                    hod
                ));
            }

            return responses;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to compile aggregated user records.");
            throw new InvalidOperationException("An error occurred while fetching users.", ex);
        }
    }

    public async Task<List<HodResponse>> GetHodAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var connection = new MySqlConnection(_connectionStrings.HodMaster);
            var results = await connection.QueryAsync<HodResponse>(
                new CommandDefinition(Queries.GetHodData, cancellationToken: cancellationToken)
            );
            return results.AsList();
        }
        catch (MySqlException ex)
        {
            logger.LogError(ex, "A database error occurred while fetching HOD master records.");
            throw new InvalidOperationException("An error occurred while fetching HOD records.", ex);
        }
    }

    public async Task<UserResponse?> GetUserByIdAsync(int userId, CancellationToken cancellation)
    {
        var users = await GetUsersAsync(cancellation);
        return users.FirstOrDefault(u => u.UserId == userId);
    }

    public Task<UserResponse?> GetEmployeeByIdAsync(int userId, CancellationToken cancellation)
        => GetUserByIdAsync(userId, cancellation);

    public async Task<List<UserResponse>> GetEmployeesByDepartmentAsync(int departmentId, CancellationToken cancellation)
    {
        var users = await GetUsersAsync(cancellation);
        return users
            .Where(user => user.Department.DepartmentId == departmentId)
            .OrderBy(user => user.UserId)
            .ToList();
    }

    public async Task<List<UserResponse>> SearchEmployeesAsync(string searchTerm, CancellationToken cancellation)
    {
        var users = await GetUsersAsync(cancellation);
        var term = searchTerm?.Trim();

        if (string.IsNullOrWhiteSpace(term))
        {
            return users.OrderBy(user => user.UserId).ToList();
        }

        return users
            .Where(user =>
                user.UserId.ToString().Contains(term, StringComparison.OrdinalIgnoreCase) ||
                user.UserName.Contains(term, StringComparison.OrdinalIgnoreCase))
            .OrderBy(user => user.UserId)
            .ToList();
    }

    public async Task UpdateEmployeeAsync(int userId, string? role, string? location, CancellationToken cancellation)
    {
        var employee = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == userId, cancellation);
        if (employee == null)
        {
            throw new KeyNotFoundException($"Employee with UserId {userId} not found.");
        }
        if (!string.IsNullOrWhiteSpace(role))
        {
            employee.UserRole = Enum.TryParse<UserRole>(role, true, out var parsedRole) ? parsedRole : null;
        }
        if (!string.IsNullOrWhiteSpace(location))
        {
            employee.Location = location;
        }
        await dbContext.SaveChangesAsync(cancellation);
    }

    public async Task<UserResponse?> UpdateEmployeeAsync(int userId, UpdateEmployeeRequest request, CancellationToken cancellation)
    {
        await UpdateEmployeeAsync(userId, request.Role, request.Location, cancellation);
        return await GetUserByIdAsync(userId, cancellation);
    }

    public async Task<bool> DeleteEmployeeAsync(int userId, CancellationToken cancellation)
    {
        var employee = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == userId, cancellation);
        if (employee is null)
        {
            return false;
        }

        employee.IsActive = false;
        employee.UpdatedOn = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellation);
        return true;
    }

    private static UserRole? ParseRole(string? role)
        => Enum.TryParse<UserRole>(role, true, out var parsedRole) ? parsedRole : null;

    private sealed record CmplUserDto(
        int UserId,
        string? EmployeeId,
        string UserName,
        string Email,
        long? Mobile,
        int DeptId);

    public sealed record UserResponse(
        int UserId,
        string? EmployeeId,
        string UserName,
        string Email,
        long? Mobile,
        string? Location,
        string? Role,
        DepartmentResponse Department,
        HodResponse? Hod);

    public sealed record DepartmentResponse(
        int DepartmentId,
        string DepartmentName,
        int? HodId);

    public sealed record HodResponse(
        string EmployeeId,
        string Name,
        string Email,
        string? Mobile);
}
