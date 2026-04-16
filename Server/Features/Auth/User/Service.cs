using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
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
                    DepartmentName = e.Department != null && !string.IsNullOrWhiteSpace(e.Department.DeptName) ? e.Department.DeptName : "N/A",
                    Role = string.IsNullOrWhiteSpace(e.UserRole) ? "User" : e.UserRole!,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user is null)
            {
                Console.WriteLine($"[DEBUG] UserId {userId} NOT FOUND in database.");
                return null;
            }

            var departmentHod = await ResolveDepartmentHodAsync(
                user.DepartmentId > 0 ? user.DepartmentId : null,
                cancellationToken);

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
                departmentHod);

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
            .Where(e => e.UserRole == role.ToString())
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
                new DepartmentHodDto(0, string.Empty, string.Empty)
            ))
            .ToListAsync(cancellationToken);
        return users;
    }

    private async Task<DepartmentHodDto> ResolveDepartmentHodAsync(int? departmentId, CancellationToken cancellationToken)
    {
        if (!departmentId.HasValue || departmentId.Value <= 0)
        {
            return new DepartmentHodDto(0, string.Empty, string.Empty);
        }

        var department = await dbContext.Departments
            .AsNoTracking()
            .Where(d => d.DeptId == departmentId.Value)
            .Select(d => d.DeptHodId)
            .FirstOrDefaultAsync(cancellationToken);

        if (department <= 0)
        {
            return new DepartmentHodDto(0, string.Empty, string.Empty);
        }

        var hod = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == department && e.UserRole == RoleNames.Hod)
            .Select(e => new
            {
                e.EmployeeId,
                Name = BuildDisplayName(e.FirstName, e.LastName, e.UserName),
                Email = e.Email ?? string.Empty,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return hod is not null
            ? new DepartmentHodDto(hod.EmployeeId, hod.Name, hod.Email)
            : new DepartmentHodDto(0, string.Empty, string.Empty);
    }

    public async Task<UserProfileDto?> UpdateUserAsync(int userId, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        // 1. Fetch the existing employee using FirstOrDefault to avoid "Multiple Elements" crash
        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId, cancellationToken);

        if (employee is null)
        {
            return null; // Or throw a NotFoundException
        }

        // 2. Handle EmployeeId Update + Duplicate Check
        if (request.EmployeeId.HasValue && request.EmployeeId.Value > 0)
        {
            var newEmployeeId = request.EmployeeId.Value;

            // Only check if it's actually changing
            if (employee.EmployeeId != newEmployeeId)
            {
                var idExists = await dbContext.Employees
                    .AsNoTracking()
                    .AnyAsync(e => e.EmployeeId == newEmployeeId && e.UserId != userId, cancellationToken);

                if (idExists)
                {
                    throw new InvalidOperationException($"The Employee ID '{newEmployeeId}' is already assigned to another user.");
                }

                employee.EmployeeId = newEmployeeId;
            }
        }

        // 3. Handle UserName Update + Duplicate Check
        if (!string.IsNullOrWhiteSpace(request.UserName))
        {
            var normalizedUserName = request.UserName.Trim();

            if (employee.UserName != normalizedUserName)
            {
                var nameExists = await dbContext.Employees
                    .AsNoTracking()
                    .AnyAsync(e => e.UserName == normalizedUserName && e.UserId != userId, cancellationToken);

                if (nameExists)
                {
                    throw new InvalidOperationException($"Username '{normalizedUserName}' is already in use.");
                }

                employee.UserName = normalizedUserName;
            }
        }

        // 4. Update Profile Fields
        if (!string.IsNullOrWhiteSpace(request.FirstName)) employee.FirstName = request.FirstName.Trim();
        if (!string.IsNullOrWhiteSpace(request.LastName)) employee.LastName = request.LastName.Trim();
        if (!string.IsNullOrWhiteSpace(request.Email)) employee.Email = request.Email.Trim();
        if (!string.IsNullOrWhiteSpace(request.Phone)) employee.Mobile = request.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(request.Location)) employee.Location = request.Location.Trim();
        if (!string.IsNullOrWhiteSpace(request.Role)) employee.UserRole = request.Role.Trim();

        // 5. Update Department Info
        if (request.DepartmentId.HasValue) employee.DeptId = request.DepartmentId.Value;
        if (!string.IsNullOrWhiteSpace(request.DepartmentName)) employee.Department.DeptName = request.DepartmentName.Trim();

        // 6. HOD details are derived from the user's department and role at read time.

        // 7. Finalize and Save
        employee.UpdatedOn = DateTime.UtcNow;

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException("A database error occurred while updating the user. Please check for duplicate unique fields.", ex);
        }

        // 8. Return fresh data using the (possibly new) EmployeeId
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
