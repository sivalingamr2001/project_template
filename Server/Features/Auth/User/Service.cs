using Microsoft.EntityFrameworkCore;
using System;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;
using Server.Domain.Entities;

namespace Server.Features.Auth.User;

public sealed class UserService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<UserListItemDto>> GetUsersAsync(
        GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        try
        {
            var baseQuery = dbContext.Employees
                .AsNoTracking()
                .OrderBy(employee => employee.EmployeeId)
                .Select(e => new UserListItemDto(
                    e.UserId,
                    e.EmployeeId,
                    BuildDisplayName(e.FirstName, e.LastName, e.UserName),
                    e.Email ?? string.Empty,
                    string.IsNullOrWhiteSpace(e.DeptName) ? "N/A" : e.DeptName!,
                    string.IsNullOrWhiteSpace(e.UserRole) ? "User" : e.UserRole!))
                .AsQueryable();

            var totalCount = await dbContext.Employees.AsNoTracking().CountAsync(cancellationToken);

            var users = await baseQuery
                .Skip(query.Skip)
                .Take(query.NormalizedPageSize)
                .ToListAsync(cancellationToken);

            return new PaginatedResponse<UserListItemDto>(users, totalCount, query.NormalizedPage, query.NormalizedPageSize);
        }
        catch (OperationCanceledException)
        {
            // Handle or rethrow if the request was timed out or cancelled
            throw;
        }
        catch (Exception ex)
        {
            // Log the exception here (e.g., _logger.LogError(ex, "Failed to fetch users"))
            throw new Exception("An error occurred while retrieving users.", ex);
        }
    }
    

    public async Task<UserProfileDto?> GetUserByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .Select(e => new UserProfileDto(
                e.UserId,
                e.EmployeeId,
                e.UserName,
                BuildDisplayName(e.FirstName, e.LastName, e.UserName),
                e.Email ?? string.Empty,
                e.Mobile ?? string.Empty,
                e.DeptId ?? 0,
                string.IsNullOrWhiteSpace(e.DeptName) ? "N/A" : e.DeptName!,
                string.IsNullOrWhiteSpace(e.UserRole) ? "User" : e.UserRole!,
                new DepartmentHodDto(
                    e.HodId ?? 0,
                    string.IsNullOrWhiteSpace(e.HodName) ? string.Empty : e.HodName!,
                    string.IsNullOrWhiteSpace(e.HodEmail) ? string.Empty : e.HodEmail!)))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<UserProfileDto?> UpdateUserAsync(int userId, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        EmployeeEntity? employee;
        try
        {
            employee = await dbContext.Employees.SingleOrDefaultAsync(e => e.UserId == userId, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            throw new InvalidOperationException($"Multiple users found for user_id '{userId}'.", ex);
        }

        if (employee is null)
        {
            return null;
        }

        var employeeId = employee.EmployeeId;

        if (!string.IsNullOrWhiteSpace(request.UserName))
        {
            var normalizedUserName = request.UserName.Trim();
            var exists = await dbContext.Employees
                .AsNoTracking()
                .AnyAsync(e => e.EmployeeId != employeeId && e.UserName == normalizedUserName, cancellationToken);

            if (exists)
            {
                throw new InvalidOperationException($"Username '{normalizedUserName}' is already in use.");
            }

            employee.UserName = normalizedUserName;
        }

        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            employee.FirstName = request.FirstName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            employee.LastName = request.LastName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            employee.Email = request.Email.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            employee.Mobile = request.Phone.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            employee.Location = request.Location.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            employee.UserRole = request.Role.Trim();
        }

        if (request.DepartmentId is not null)
        {
            employee.DeptId = request.DepartmentId.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.DepartmentName))
        {
            employee.DeptName = request.DepartmentName.Trim();
        }

        if (request.HodEmployeeId is not null)
        {
            if (request.HodEmployeeId.Value <= 0)
            {
                employee.HodId = null;
                employee.HodName = string.Empty;
                employee.HodEmail = string.Empty;
            }
            else
            {
                var hod = await dbContext.Employees
                    .AsNoTracking()
                    .Where(e => e.EmployeeId == request.HodEmployeeId.Value)
                    .Select(e => new
                    {
                        e.EmployeeId,
                        Name = BuildDisplayName(e.FirstName, e.LastName, e.UserName),
                        e.Email
                    })
                    .SingleOrDefaultAsync(cancellationToken);

                if (hod is not null)
                {
                    employee.HodId = hod.EmployeeId;
                    employee.HodName = hod.Name;
                    employee.HodEmail = hod.Email;
                }
            }
        }

        employee.UpdatedOn = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetUserByIdAsync(employeeId, cancellationToken);
    }

    public async Task<UserProfileDto> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        if (request.EmployeeId <= 0)
        {
            throw new InvalidOperationException("EmployeeId must be a positive number.");
        }

        var userName = request.UserName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userName))
        {
            throw new InvalidOperationException("UserName is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException("Password is required.");
        }

        var employeeIdExists = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.EmployeeId == request.EmployeeId, cancellationToken);
        if (employeeIdExists)
        {
            throw new InvalidOperationException($"EmployeeId '{request.EmployeeId}' already exists.");
        }

        var userNameExists = await dbContext.Employees
            .AsNoTracking()
            .AnyAsync(e => e.UserName == userName, cancellationToken);
        if (userNameExists)
        {
            throw new InvalidOperationException($"UserName '{userName}' already exists.");
        }

        var entity = new EmployeeEntity
        {
            EmployeeId = request.EmployeeId,
            UserId = 0,
            FirstName = request.FirstName?.Trim() ?? string.Empty,
            LastName = request.LastName?.Trim() ?? string.Empty,
            UserName = userName,
            Password = request.Password,
            Email = request.Email?.Trim() ?? string.Empty,
            Mobile = request.Phone?.Trim() ?? string.Empty,
            DeptId = request.DepartmentId,
            DeptName = request.DepartmentName?.Trim() ?? string.Empty,
            Location = string.Empty,
            UserRole = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role.Trim(),
            HodId = request.HodEmployeeId is > 0 ? request.HodEmployeeId : null,
            HodName = string.Empty,
            HodEmail = string.Empty,
            IsActive = true,
            CreatedOn = DateTime.UtcNow,
            CreatedBy = "0",
            UpdatedOn = DateTime.UtcNow,
            ModifiedBy = null,
        };

        await dbContext.Employees.AddAsync(entity, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var created = await GetUserByIdAsync(entity.EmployeeId, cancellationToken);
        if (created is null)
        {
            throw new InvalidOperationException("Unable to load created user.");
        }

        return created;
    }

    public async Task<bool> UpdatePasswordAsync(int employeeId, UpdatePasswordRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException("Password is required.");
        }

        var employee = await dbContext.Employees.SingleOrDefaultAsync(e => e.EmployeeId == employeeId, cancellationToken);
        if (employee is null)
        {
            return false;
        }
        
        employee.Password = request.Password;
        employee.UpdatedOn = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
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
