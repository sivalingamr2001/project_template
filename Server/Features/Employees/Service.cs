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
