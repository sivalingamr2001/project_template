using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Features.Common;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;

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
                    e.Department != null && !string.IsNullOrWhiteSpace(e.Department.DeptName) ? e.Department.DeptName : "N/A",
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


    public async Task<UserProfileDto?> GetUserByIdAsync(int userId, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"[DEBUG] Fetching user with UserId: {userId}");

            var user = await dbContext.Employees
                .AsNoTracking()
                .Where(e => e.UserId == userId)
                .Select(e => new
                {
                    e.UserId,
                    e.EmployeeId,
                    e.UserName,
                    Name = BuildDisplayName(e.FirstName, e.LastName, e.UserName),
                    Email = e.Email ?? string.Empty,
                    Phone = e.Mobile ?? string.Empty,
                    DepartmentId = e.DeptId ?? 0,
                    DepartmentName = e.Department != null && !string.IsNullOrWhiteSpace(e.Department.DeptName)
                        ? e.Department.DeptName
                        : "N/A",
                    DepartmentHod = e.Department != null
                        ? new DepartmentDto(
                            e.Department.Id,
                            e.Department.DeptId,
                            e.Department.DeptName,
                            e.Department.DeptHodId,
                            e.Department.HeadOfDepartment != null
                                ? BuildDisplayName(e.Department.HeadOfDepartment.FirstName, e.Department.HeadOfDepartment.LastName, e.Department.HeadOfDepartment.UserName)
                                : string.Empty,
                            e.Department.HeadOfDepartment != null
                                ? e.Department.HeadOfDepartment.Email ?? string.Empty
                                : string.Empty,
                            e.Department.HeadOfDepartment != null
                                ? e.Department.HeadOfDepartment.Mobile ?? string.Empty
                                : string.Empty)
                        : new DepartmentDto(0, 0, string.Empty, 0, string.Empty, string.Empty, string.Empty),
                    Role = string.IsNullOrWhiteSpace(e.UserRole) ? "User" : e.UserRole!,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user is null)
            {
                Console.WriteLine($"[DEBUG] UserId {userId} NOT FOUND in database.");
                return null;
            }

            var result = new UserProfileDto(
                user.UserId,
                user.EmployeeId,
                user.UserName,
                user.Name,
                user.Email,
                user.Phone,
                user.DepartmentId,
                user.DepartmentName,
                user.Role,
                user.DepartmentHod);

            var jsonData = JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
            Console.WriteLine($"[DEBUG] Successfully fetched DTO for UserId: {userId}");
            Console.WriteLine($"[DEBUG] FULL DATA: {jsonData}");

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] GetUserByIdAsync failed for UserId {userId}");
            Console.WriteLine($"[ERROR] Message: {ex.Message}");
            throw;
        }
    }

    //Create method for getallusersbyrole
    public async Task<List<UserProfileDto>> GetUserByRoleAsync(string role, CancellationToken cancellationToken)
    {
        var users = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.UserRole == role)
            .Select(e => new UserProfileDto(
                e.UserId,
                e.EmployeeId,
                e.UserName,
                BuildDisplayName(e.FirstName, e.LastName, e.UserName),
                e.Email ?? string.Empty,
                e.Mobile ?? string.Empty,
                e.DeptId ?? 0,
                e.Department != null && !string.IsNullOrWhiteSpace(e.Department.DeptName) ? e.Department.DeptName : "N/A",
                string.IsNullOrWhiteSpace(e.UserRole) ? "User" : e.UserRole!,
                e.Department != null
                    ? new DepartmentDto(
                        e.Department.Id,
                        e.Department.DeptId,
                        e.Department.DeptName,
                        e.Department.DeptHodId,
                        e.Department.HeadOfDepartment != null
                            ? BuildDisplayName(e.Department.HeadOfDepartment.FirstName, e.Department.HeadOfDepartment.LastName, e.Department.HeadOfDepartment.UserName)
                            : string.Empty,
                        e.Department.HeadOfDepartment != null
                            ? e.Department.HeadOfDepartment.Email ?? string.Empty
                            : string.Empty,
                        e.Department.HeadOfDepartment != null
                            ? e.Department.HeadOfDepartment.Mobile ?? string.Empty
                            : string.Empty)
                    : new DepartmentDto(0, 0, string.Empty, 0, string.Empty, string.Empty, string.Empty)
            ))
            .ToListAsync(cancellationToken);
        return users;
    }

    public async Task<UserProfileDto?> UpdateUserAsync(int userId, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);

        if (employee is null) return null;

        if (request.EmployeeId.HasValue && request.EmployeeId.Value > 0)
        {
            if (employee.EmployeeId != request.EmployeeId.Value)
            {
                var idExists = await dbContext.Employees
                    .AnyAsync(e => e.EmployeeId == request.EmployeeId.Value && e.UserId != userId, cancellationToken);

                if (idExists) throw new InvalidOperationException("Employee ID already assigned.");
                employee.EmployeeId = request.EmployeeId.Value;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.UserName))
        {
            var name = request.UserName.Trim();
            if (employee.UserName != name)
            {
                var exists = await dbContext.Employees.AnyAsync(e => e.UserName == name && e.UserId != userId, cancellationToken);
                if (exists) throw new InvalidOperationException("Username in use.");
                employee.UserName = name;
            }
        }

        employee.FirstName = request.FirstName?.Trim();
        employee.LastName = request.LastName?.Trim();
        employee.Email = request.Email?.Trim() ?? employee.Email;
        employee.Mobile = request.Phone?.Trim();
        employee.Location = request.Location?.Trim() ?? employee.Location;
        employee.UserRole = request.Role?.Trim() ?? employee.UserRole;

        if (request.DepartmentId.HasValue)
        {
            if (request.DepartmentId.Value <= 0)
            {
                employee.DeptId = null;
            }
            else
            {
                var dept = await dbContext.Departments
                    .Where(d => d.DeptId == request.DepartmentId.Value)
                    .Select(d => new { d.Id })
                    .FirstOrDefaultAsync(cancellationToken);

                if (dept == null)
                {
                    throw new InvalidOperationException($"Department with Business ID {request.DepartmentId.Value} not found.");
                }

                employee.DeptId = dept.Id;
            }
        }

        employee.UpdatedOn = DateTime.UtcNow;

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException("Database update failed. Check constraints.", ex);
        }

        return await GetUserByIdAsync(employee.UserId, cancellationToken);
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

        int? departmentId = null;
        if (request.DepartmentId.HasValue)
        {
            var department = await dbContext.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeptId == request.DepartmentId.Value, cancellationToken);

            if (department is null)
            {
                throw new InvalidOperationException($"Department with Id '{request.DepartmentId.Value}' does not exist.");
            }

            departmentId = request.DepartmentId.Value;
        }

        if (request.DepartmentId.HasValue)
        {
            var department = await dbContext.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DeptId == request.DepartmentId.Value, cancellationToken);

            if (department is null)
            {
                throw new InvalidOperationException($"Department with Id '{request.DepartmentId.Value}' does not exist.");
            }

            departmentId = request.DepartmentId.Value;
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
            DeptId = departmentId,
            Location = string.Empty,
            UserRole = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role.Trim(),
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
