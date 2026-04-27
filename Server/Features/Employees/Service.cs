using Janatics.Application.Features.Employees.Dtos;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
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
            .Include(employee => employee.Department)
            .OrderBy(employee => employee.EmployeeId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(employee => new LegacyUserListItemDto(
                employee.UserId,
                employee.EmployeeId,
                BuildDisplayName(employee.FirstName, employee.LastName, employee.UserName),
                employee.Email,
                employee.Department != null ? employee.Department.DepartmentName : string.Empty,
                string.IsNullOrWhiteSpace(employee.UserRole) ? "User" : employee.UserRole))
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<LegacyUserListItemDto>(
            users,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }

    public async Task<List<EmployeeDto>> SearchEmployeesAsync(
       string term,
       CancellationToken ct)
    {
        var baseQuery = dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .AsQueryable();

        // Apply Filter
        if (!string.IsNullOrWhiteSpace(term))
        {
            string likeTerm = $"%{term}%";
            baseQuery = baseQuery.Where(e =>
                EF.Functions.Like(e.UserName, likeTerm) ||
                EF.Functions.Like(e.Email, likeTerm) ||
                EF.Functions.Like(e.EmployeeId.ToString(), likeTerm) ||
                EF.Functions.Like(e.Mobile, likeTerm) ||
                EF.Functions.Like(e.Location, likeTerm));
        }

        // Retrieve everything without Skip/Take
        var employees = await baseQuery
            .OrderBy(x => x.UserName)
            .ToListAsync(ct);

        // Map to your DTO
        return employees.Select(MapToDto).ToList();
    }

    public async Task<PaginatedResponse<EmployeeDto>> GetEmployeesAsync(
        GetEmployeesQuery query,
        CancellationToken cancellationToken)
    {
        var baseQuery = dbContext.Employees.AsNoTracking();
        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var employees = await baseQuery
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .OrderBy(x => x.EmployeeId)
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        var data = employees.Select(MapToDto).ToList();

        return new PaginatedResponse<EmployeeDto>(
            data,
            totalCount,
            query.NormalizedPage,
            query.NormalizedPageSize);
    }

    public async Task<IReadOnlyList<EmployeeDto>> GetEmployeesByDepartmentAsync(int departmentId, CancellationToken cancellationToken)
    {
        var employees = await dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .Where(x => x.DeptId == departmentId)
            .OrderBy(x => x.EmployeeId)
            .ToListAsync(cancellationToken);

        return employees.Select(MapToDto).ToList();
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, cancellationToken);

        return employee is null ? null : MapToDto(employee);
    }

    public async Task<LegacyUserProfileDto?> GetLegacyUserByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        return employee is null ? null : MapToLegacyProfileDto(employee);
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            throw new InvalidOperationException("Username, Password, and Email are required.");
        }

        var exists = await dbContext.Employees.AnyAsync(e => e.UserName == request.Username.Trim(), cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException($"Username '{request.Username}' is already taken.");
        }

        var deptExists = await dbContext.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId, cancellationToken);
        if (!deptExists)
        {
            throw new InvalidOperationException($"Department {request.DepartmentId} not found.");
        }

        var now = DateTime.UtcNow;
        var employee = new EmployeeEntity
        {
            EmployeeId = await GetNextEmployeeIdAsync(cancellationToken),
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserName = request.Username.Trim(),
            Password = request.Password,
            Email = request.Email,
            Mobile = request.Mobile,
            Location = request.Location,
            UserRole = request.Role,
            DeptId = request.DepartmentId,
            IsActive = true,
            CreatedOn = now,
            UpdatedOn = now
        };

        dbContext.Employees.Add(employee);
        await dbContext.SaveChangesAsync(cancellationToken);

        await dbContext.Entry(employee).Reference(x => x.Department).LoadAsync(cancellationToken);
        if (employee.Department != null)
        {
            await dbContext.Entry(employee.Department).Reference(x => x.Hod).LoadAsync(cancellationToken);
        }

        return MapToDto(employee);
    }

    public async Task<LegacyUserProfileDto> CreateLegacyUserAsync(LegacyCreateUserRequest request, CancellationToken cancellationToken)
    {
        if (request.EmployeeId <= 0)
        {
            throw new InvalidOperationException("Employee ID is required.");
        }

        if (string.IsNullOrWhiteSpace(request.UserName) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            throw new InvalidOperationException("Username, Password, and Email are required.");
        }

        var employeeIdExists = await dbContext.Employees
            .AnyAsync(employee => employee.EmployeeId == request.EmployeeId, cancellationToken);
        if (employeeIdExists)
        {
            throw new InvalidOperationException($"Employee ID '{request.EmployeeId}' is already in use.");
        }

        var userName = request.UserName.Trim();
        var userNameExists = await dbContext.Employees
            .AnyAsync(employee => employee.UserName == userName, cancellationToken);
        if (userNameExists)
        {
            throw new InvalidOperationException($"Username '{request.UserName}' is already taken.");
        }

        if (request.DepartmentId is null or <= 0)
        {
            throw new InvalidOperationException("Department is required.");
        }

        var departmentExists = await dbContext.Departments
            .AnyAsync(department => department.DepartmentId == request.DepartmentId.Value, cancellationToken);
        if (!departmentExists)
        {
            throw new InvalidOperationException($"Department {request.DepartmentId.Value} not found.");
        }

        var utcNow = DateTime.UtcNow;
        var employee = new EmployeeEntity
        {
            EmployeeId = request.EmployeeId,
            FirstName = request.FirstName?.Trim(),
            LastName = request.LastName?.Trim(),
            UserName = userName,
            Password = request.Password,
            Email = request.Email.Trim(),
            Mobile = request.Phone?.Trim(),
            Location = string.Empty,
            UserRole = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role.Trim(),
            DeptId = request.DepartmentId.Value,
            IsActive = true,
            CreatedOn = utcNow,
            UpdatedOn = utcNow
        };

        dbContext.Employees.Add(employee);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetLegacyUserByUserIdAsync(employee.UserId, cancellationToken)
            ?? throw new InvalidOperationException("Unable to load created employee.");
    }

    public async Task<EmployeeDto?> UpdateEmployeeAsync(int employeeId, UpdateEmployeeRequest request, CancellationToken cancellationToken)
    {
        var departmentExists = await dbContext.Departments
            .AnyAsync(d => d.DepartmentId == request.DepartmentId, cancellationToken);

        if (!departmentExists)
        {
            throw new InvalidOperationException($"Department {request.DepartmentId} not found.");
        }

        var employee = await dbContext.Employees
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, cancellationToken);

        if (employee == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(request.FirstName))
        {
            employee.FirstName = request.FirstName;
        }

        if (!string.IsNullOrWhiteSpace(request.LastName))
        {
            employee.LastName = request.LastName;
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            employee.Email = request.Email;
        }

        if (!string.IsNullOrWhiteSpace(request.Mobile))
        {
            employee.Mobile = request.Mobile;
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            employee.Location = request.Location;
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            employee.UserRole = request.Role;
        }

        employee.IsActive = request.IsActive;
        employee.DeptId = request.DepartmentId;
        employee.UpdatedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        await dbContext.Entry(employee).Reference(x => x.Department).LoadAsync(cancellationToken);
        if (employee.Department != null)
        {
            await dbContext.Entry(employee.Department).Reference(x => x.Hod).LoadAsync(cancellationToken);
        }

        return MapToDto(employee);
    }

    public async Task<LegacyUserProfileDto?> UpdateLegacyUserAsync(
        int userId,
        LegacyUpdateUserRequest request,
        CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .Include(x => x.Department)
            .ThenInclude(x => x!.Hod)
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

        if (employee is null)
        {
            return null;
        }

        if (request.EmployeeId.HasValue && request.EmployeeId.Value > 0 && employee.EmployeeId != request.EmployeeId.Value)
        {
            var employeeIdExists = await dbContext.Employees
                .AnyAsync(x => x.EmployeeId == request.EmployeeId.Value && x.UserId != userId, cancellationToken);
            if (employeeIdExists)
            {
                throw new InvalidOperationException("Employee ID already assigned.");
            }

            employee.EmployeeId = request.EmployeeId.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.UserName))
        {
            var userName = request.UserName.Trim();
            if (!string.Equals(employee.UserName, userName, StringComparison.Ordinal))
            {
                var userNameExists = await dbContext.Employees
                    .AnyAsync(x => x.UserName == userName && x.UserId != userId, cancellationToken);
                if (userNameExists)
                {
                    throw new InvalidOperationException("Username in use.");
                }

                employee.UserName = userName;
            }
        }

        employee.FirstName = request.FirstName?.Trim();
        employee.LastName = request.LastName?.Trim();

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            employee.Email = request.Email.Trim();
        }

        employee.Mobile = request.Phone?.Trim();
        employee.Location = request.Location?.Trim() ?? employee.Location;
        employee.UserRole = string.IsNullOrWhiteSpace(request.Role) ? employee.UserRole : request.Role.Trim();

        if (request.DepartmentId.HasValue)
        {
            var departmentExists = await dbContext.Departments
                .AnyAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (!departmentExists)
            {
                throw new InvalidOperationException($"Department {request.DepartmentId.Value} not found.");
            }

            employee.DeptId = request.DepartmentId.Value;
        }

        employee.UpdatedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetLegacyUserByUserIdAsync(employee.UserId, cancellationToken);
    }

    public async Task<bool> DeleteEmployeeAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, cancellationToken);

        if (employee == null)
        {
            return false;
        }

        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> UpdatePasswordAsync(int employeeId, string password, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException("Password is required.");
        }

        var employee = await dbContext.Employees
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId, cancellationToken);

        if (employee is null)
        {
            return false;
        }

        employee.Password = password;
        employee.UpdatedOn = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<int> GetNextEmployeeIdAsync(CancellationToken cancellationToken)
    {
        var maxEmployeeId = await dbContext.Employees
            .AsNoTracking()
            .Select(employee => (int?)employee.EmployeeId)
            .MaxAsync(cancellationToken);

        return (maxEmployeeId ?? 0) + 1;
    }

    private static EmployeeDto MapToDto(EmployeeEntity employee)
    {
        return new EmployeeDto(
            employee.EmployeeId,
            employee.FirstName ?? string.Empty,
            employee.LastName ?? string.Empty,
            employee.UserName,
            employee.Email,
            employee.Mobile ?? string.Empty,
            employee.Location ?? string.Empty,
            employee.UserRole,
            employee.IsActive,
            employee.CreatedOn,
            employee.UpdatedOn,
            employee.DeptId ?? 0,
            employee.Department is null
                ? null
                : new DepartmentDetailDto(
                    employee.Department.DepartmentId,
                    employee.Department.DepartmentName,
                    employee.Department.Hod is null
                        ? null
                        : new HodDto(
                            employee.Department.Hod.EmployeeId,
                            employee.Department.Hod.FirstName ?? string.Empty,
                            employee.Department.Hod.LastName ?? string.Empty,
                            employee.Department.Hod.UserName,
                            employee.Department.Hod.Email,
                            employee.Department.Hod.Mobile ?? string.Empty,
                            employee.Department.Hod.Location ?? string.Empty,
                            employee.Department.Hod.UserRole,
                            employee.Department.Hod.IsActive)));
    }

    private static LegacyUserProfileDto MapToLegacyProfileDto(EmployeeEntity employee)
    {
        return new LegacyUserProfileDto(
            employee.UserId,
            employee.EmployeeId,
            employee.UserName,
            BuildDisplayName(employee.FirstName, employee.LastName, employee.UserName),
            employee.Email,
            employee.Mobile ?? string.Empty,
            employee.DeptId ?? 0,
            employee.Department?.DepartmentName ?? string.Empty,
            string.IsNullOrWhiteSpace(employee.UserRole) ? "User" : employee.UserRole,
            employee.Department?.Hod is null
                ? null
                : new LegacyDepartmentHodDto(
                    employee.Department.Hod.EmployeeId,
                    BuildDisplayName(
                        employee.Department.Hod.FirstName,
                        employee.Department.Hod.LastName,
                        employee.Department.Hod.UserName),
                    employee.Department.Hod.Email,
                    employee.Department.Hod.Mobile ?? string.Empty));
    }

    private static string BuildDisplayName(string? firstName, string? lastName, string userName)
    {
        var combined = $"{firstName ?? string.Empty} {lastName ?? string.Empty}".Trim();
        return string.IsNullOrWhiteSpace(combined) ? userName : combined;
    }
}
