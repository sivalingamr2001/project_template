using Microsoft.EntityFrameworkCore;
using Server.Domain.Common;
using Server.Domain.Entities;
using Server.Domain.Errors;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Employees;

public sealed class EmployeesService(
    AppDbContext dbContext,
    PasswordHasher passwordHasher,
    ILogger<EmployeesService> logger)
{
    public async Task<Result<IReadOnlyList<EmployeeSummaryDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var employees = await dbContext.Employees
            .AsNoTracking()
            .OrderBy(e => e.EmployeeId)
            .Select(e => new EmployeeSummaryDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Phone,
                e.DepartmentId,
                e.DepartmentName,
                e.Role))
            .ToListAsync(cancellationToken);

        return employees;
    }

    public async Task<Result<EmployeeDto>> GetByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .Select(e => new EmployeeDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Phone,
                e.DepartmentId,
                e.DepartmentName,
                e.Role))
            .SingleOrDefaultAsync(cancellationToken);

        return employee is null
            ? NotFound(employeeId)
            : employee;
    }

    public async Task<Result<EmployeeDto>> CreateAsync(CreateEmployeeRequest request, CancellationToken cancellationToken)
    {
        if (await dbContext.Employees.CountAsync(e => e.EmployeeId == request.EmployeeId, cancellationToken) > 0)
        {
            return DuplicateEmployee(request.EmployeeId);
        }

        var password = string.IsNullOrWhiteSpace(request.Password) ? "0000" : request.Password;
        var (hash, salt) = passwordHasher.HashPassword(password);

        var employee = new EmployeeEntity
        {
            EmployeeId = request.EmployeeId,
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone,
            DepartmentId = request.DepartmentId,
            DepartmentName = request.DepartmentName.Trim(),
            Role = request.Role.Trim(),
            PasswordHash = hash,
            PasswordSalt = salt
        };

        dbContext.Employees.Add(employee);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return ToDto(employee);
        }
        catch (DbUpdateException ex)
        {
            logger.LogWarning(ex, "Unable to create employee with id {EmployeeId}", request.EmployeeId);
            return DuplicateEmployee(request.EmployeeId);
        }
    }

    public async Task<Result<EmployeeDto>> UpdateAsync(int employeeId, UpdateEmployeeRequest request, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees.SingleOrDefaultAsync(
            e => e.EmployeeId == employeeId,
            cancellationToken);

        if (employee is null)
        {
            return NotFound(employeeId);
        }

        employee.Name = request.Name.Trim();
        employee.Email = request.Email.Trim();
        employee.Phone = request.Phone;
        employee.DepartmentId = request.DepartmentId;
        employee.DepartmentName = request.DepartmentName.Trim();
        employee.Role = request.Role.Trim();

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var (hash, salt) = passwordHasher.HashPassword(request.Password);
            employee.PasswordHash = hash;
            employee.PasswordSalt = salt;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return ToDto(employee);
    }

    public async Task<Result> DeleteAsync(int employeeId, CancellationToken cancellationToken)
    {
        var employee = await dbContext.Employees.SingleOrDefaultAsync(
            e => e.EmployeeId == employeeId,
            cancellationToken);

        if (employee is null)
        {
            return Result.Failure(NotFound(employeeId));
        }

        dbContext.Employees.Remove(employee);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static EmployeeDto ToDto(EmployeeEntity employee)
        => new(
            employee.EmployeeId,
            employee.Name,
            employee.Email,
            employee.Phone,
            employee.DepartmentId,
            employee.DepartmentName,
            employee.Role);

    private static ServiceError DuplicateEmployee(int employeeId)
        => new($"Employee '{employeeId}' already exists.", ErrorCode.Conflict);

    private static ServiceError NotFound(int employeeId)
        => new($"Employee '{employeeId}' was not found.", ErrorCode.NotFound);
}
