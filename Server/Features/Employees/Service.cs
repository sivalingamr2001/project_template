using Janatics.Application.Features.Employees.Dtos;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Employees;

public sealed class EmployeeService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<LegacyUserListItemDto>> GetLegacyUsersAsync(
        GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var baseQuery = dbContext.Employees.AsNoTracking();
        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var users = await baseQuery
            .OrderBy(employee => employee.UserId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(employee => new LegacyUserListItemDto(
                employee.UserId,
                employee.EmployeeId ?? 0,
                employee.Email,
                employee.Email,
                string.Empty,
                (employee.UserRole ?? UserRole.User).ToString()))
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<LegacyUserListItemDto>(
            users,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }

    public async Task<List<EmployeeDto>> SearchEmployeesAsync(string term, CancellationToken ct)
    {
        var baseQuery = dbContext.Employees.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(term))
        {
            string likeTerm = $"%{term}%";
            baseQuery = baseQuery.Where(e =>
                EF.Functions.Like(e.Email, likeTerm) ||
                EF.Functions.Like(e.UserId.ToString(), likeTerm) ||
                (e.EmployeeId.HasValue && EF.Functions.Like(e.EmployeeId.Value.ToString(), likeTerm)));
        }

        var employees = await baseQuery.OrderBy(x => x.UserId).ToListAsync(ct);
        return employees.Select(MapToDto).ToList();
    }

    public async Task<PaginatedResponse<EmployeeDto>> GetEmployeesAsync(
        GetEmployeesQuery query,
        CancellationToken cancellationToken)
    {
        var baseQuery = dbContext.Employees.AsNoTracking();
        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var employees = await baseQuery
            .OrderBy(x => x.UserId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<EmployeeDto>(
            employees.Select(MapToDto).ToList(),
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }

    public Task<IReadOnlyList<EmployeeDto>> GetEmployeesByDepartmentAsync(int departmentId, CancellationToken cancellationToken)
    {
        // Local authorization DB no longer stores department membership.
        _ = departmentId;
        _ = cancellationToken;
        return Task.FromResult<IReadOnlyList<EmployeeDto>>(Array.Empty<EmployeeDto>());
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => (x.EmployeeId ?? 0) == employeeId, cancellationToken);

        return employee is null ? null : MapToDto(employee);
    }

    public async Task<LegacyUserProfileDto?> GetLegacyUserByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        return employee is null ? null : MapToLegacyProfileDto(employee);
    }

    public Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeRequest request, CancellationToken cancellationToken)
    {
        _ = request;
        _ = cancellationToken;
        throw new InvalidOperationException("Local profile creation is disabled. Users are provisioned on first successful CMPL login.");
    }

    public Task<LegacyUserProfileDto> CreateLegacyUserAsync(LegacyCreateUserRequest request, CancellationToken cancellationToken)
    {
        _ = request;
        _ = cancellationToken;
        throw new InvalidOperationException("Local profile creation is disabled. Users are provisioned on first successful CMPL login.");
    }

    public Task<EmployeeDto?> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequest request, CancellationToken cancellationToken)
    {
        _ = employeeId;
        _ = request;
        _ = cancellationToken;
        throw new InvalidOperationException("Local profile updates are disabled. Profile data comes from CMPL DB.");
    }

    public Task<LegacyUserProfileDto?> UpdateLegacyUserAsync(int userId, LegacyUpdateUserRequest request, CancellationToken cancellationToken)
    {
        _ = userId;
        _ = request;
        _ = cancellationToken;
        throw new InvalidOperationException("Local profile updates are disabled. Profile data comes from CMPL DB.");
    }

    public async Task<bool> DeleteEmployeeAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(x => (x.EmployeeId ?? 0) == employeeId, cancellationToken);

        if (employee == null)
        {
            return false;
        }

        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> UpdatePasswordAsync(int employeeId, string password, CancellationToken cancellationToken)
    {
        _ = employeeId;
        _ = password;
        _ = cancellationToken;
        throw new InvalidOperationException("Local password updates are disabled. Authentication is handled by CMPL DB.");
    }

    private static EmployeeDto MapToDto(EmployeeEntity employee)
    {
        return new EmployeeDto(
            employee.EmployeeId ?? 0,
            string.Empty,
            string.Empty,
            employee.Email,
            employee.Email,
            string.Empty,
            string.Empty,
            (employee.UserRole ?? UserRole.User).ToString(),
            employee.IsActive,
            employee.CreatedOn,
            employee.UpdatedOn,
            0,
            null);
    }

    private static LegacyUserProfileDto MapToLegacyProfileDto(EmployeeEntity employee)
    {
        return new LegacyUserProfileDto(
            employee.UserId,
            employee.EmployeeId ?? 0,
            employee.Email,
            employee.Email,
            employee.Email,
            string.Empty,
            0,
            string.Empty,
            (employee.UserRole ?? UserRole.User).ToString(),
            null);
    }
}

