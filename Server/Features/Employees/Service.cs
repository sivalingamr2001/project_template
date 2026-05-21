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
    IOptions<ConnectionStrings> connectionStrings,
    ILogger<EmployeeService> logger)
{
    private readonly ConnectionStrings _connectionStrings = connectionStrings.Value;

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
            var hodUserIds = cmplUsers.Where(u => u.HodId.HasValue).Select(u => u.HodId!.Value).Distinct().ToList();

            // 2. Run database calls concurrently to prevent blocking bottlenecks
            var localUsersTask = dbContext.Employees
                .AsNoTracking()
                .Where(u => userIds.Contains(u.UserId))
                .ToDictionaryAsync(u => u.UserId, u => u.UserRole?.ToString(), cancellationToken);

            // Project only the necessary fields (UserId, Email) from the local Employee table
            var localHodsTask = dbContext.Employees
                .AsNoTracking()
                .Where(e => hodUserIds.Contains(e.UserId))
                .Select(e => new { e.UserId, e.Email })
                .ToListAsync(cancellationToken);

            var rawHodsListTask = GetHodAsync(cancellationToken);

            await Task.WhenAll(localUsersTask, localHodsTask, rawHodsListTask);

            var localUsersDict = localUsersTask.Result;
            var localHods = localHodsTask.Result;
            var rawHodsMasterList = rawHodsListTask.Result;

            // 3. Index the HOD Master list by Email for O(1) lookup speeds
            var hodMasterByEmail = rawHodsMasterList
                .Where(h => !string.IsNullOrWhiteSpace(h.Email))
                .DistinctBy(h => h.Email, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(h => h.Email, h => h, StringComparer.OrdinalIgnoreCase);

            // 4. Map the local HOD user ID to its matching master record
            var hodDetailsDict = new Dictionary<int, HodResponse>();
            foreach (var localHod in localHods)
            {
                if (!string.IsNullOrWhiteSpace(localHod.Email) &&
                    hodMasterByEmail.TryGetValue(localHod.Email, out var matchedMasterHod))
                {
                    hodDetailsDict[localHod.UserId] = matchedMasterHod;
                }
            }

            // 5. Build final responses
            var responses = new List<UserResponse>(cmplUsers.Count);
            foreach (var user in cmplUsers)
            {
                localUsersDict.TryGetValue(user.UserId, out var role);

                HodResponse? hod = null;
                if (user.HodId.HasValue)
                {
                    hodDetailsDict.TryGetValue(user.HodId.Value, out hod);
                }

                responses.Add(new UserResponse(
                    user.UserId,
                    user.EmployeeId,
                    user.UserName,
                    user.Email,
                    user.Mobile,
                    user.Location,
                    role,
                    new DepartmentResponse(user.DepartmentId, user.DepartmentName, user.HodId),
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
            // Dapper will automatically map 'name', 'email', and 'mobile' columns to your record properties
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
                user.EmployeeId.ToString().Contains(term, StringComparison.OrdinalIgnoreCase) ||
                user.UserName.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                user.Email.Contains(term, StringComparison.OrdinalIgnoreCase))
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

    public async Task<PaginatedResponse<LegacyUserListItemDto>> GetLegacyUsersAsync(
        GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var users = await GetUsersAsync(cancellationToken);
        var totalCount = users.Count;
        var data = users
            .OrderBy(user => user.UserId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(user => new LegacyUserListItemDto(
                user.UserId,
                user.EmployeeId,
                user.UserName,
                user.Email,
                user.Department.DepartmentName,
                user.Role ?? UserRole.User.ToString()))
            .ToList();

        return new PaginatedResponse<LegacyUserListItemDto>(
            data,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }

    public async Task<LegacyUserProfileDto?> GetLegacyUserByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        var user = await GetUserByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        return new LegacyUserProfileDto(
            user.UserId,
            user.EmployeeId,
            user.UserName,
            user.UserName,
            user.Email,
            user.Mobile,
            user.Department.DepartmentId,
            user.Department.DepartmentName,
            user.Role ?? UserRole.User.ToString(),
            user.Hod is null
                ? null
                : new LegacyDepartmentHodDto(
                    user.Hod.EmployeeId,
                    user.Hod.Name,
                    user.Hod.Email,
                    user.Hod.Mobile));
    }

    public async Task<LegacyUserProfileDto> CreateLegacyUserAsync(LegacyCreateUserRequest request, CancellationToken cancellationToken)
    {
        if (request.EmployeeId is null or <= 0)
        {
            throw new InvalidOperationException("EmployeeId is required to create a local user.");
        }

        var cmplUser = (await GetUsersAsync(cancellationToken))
            .FirstOrDefault(user => user.EmployeeId == request.EmployeeId.Value);

        if (cmplUser is null)
        {
            throw new InvalidOperationException($"CMPL user with EmployeeId {request.EmployeeId.Value} was not found.");
        }

        var existing = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == cmplUser.UserId, cancellationToken);
        if (existing is null)
        {
            existing = new Domain.Entities.EmployeeEntity
            {
                UserId = cmplUser.UserId,
                EmployeeId = cmplUser.EmployeeId.ToString(),
                Email = string.IsNullOrWhiteSpace(request.Email) ? cmplUser.Email : request.Email,
                UserRole = ParseRole(request.Role),
                Location = null,
                IsActive = true,
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow
            };

            dbContext.Employees.Add(existing);
        }
        else
        {
            existing.Email = string.IsNullOrWhiteSpace(request.Email) ? existing.Email : request.Email;
            existing.UserRole = ParseRole(request.Role) ?? existing.UserRole;
            existing.UpdatedOn = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetLegacyUserByUserIdAsync(cmplUser.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Unable to load the created user.");
    }

    public async Task<LegacyUserProfileDto?> UpdateLegacyUserAsync(int userId, LegacyUpdateUserRequest request, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);
        if (employee is null)
        {
            throw new KeyNotFoundException($"User with UserId {userId} not found.");
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            employee.Email = request.Email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            employee.Location = request.Location.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            employee.UserRole = ParseRole(request.Role);
        }

        employee.UpdatedOn = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetLegacyUserByUserIdAsync(userId, cancellationToken);
    }

    public async Task UpdatePasswordAsync(int userId, string password, CancellationToken cancellationToken)
    {
        _ = password;

        var employee = await dbContext.Employees.FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);
        if (employee is null)
        {
            throw new KeyNotFoundException($"User with UserId {userId} not found.");
        }

        employee.UpdatedOn = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static UserRole? ParseRole(string? role)
        => Enum.TryParse<UserRole>(role, true, out var parsedRole) ? parsedRole : null;

    private sealed record CmplUserDto(
        int UserId,
        int EmployeeId,
        string UserName,
        string Email,
        string Mobile,
        string Location,
        int DepartmentId,
        string DepartmentName,
        int? HodId);

    public sealed record UserResponse(
        int UserId,
        int EmployeeId,
        string UserName,
        string Email,
        string Mobile,
        string Location,
        string? Role,
        DepartmentResponse Department,
        HodResponse? Hod);

    public sealed record DepartmentResponse(
        int DepartmentId,
        string DepartmentName,
        int? HodId);

    public sealed record HodResponse(
        int EmployeeId,
        string Name,
        string Email,
        string Mobile);
}
