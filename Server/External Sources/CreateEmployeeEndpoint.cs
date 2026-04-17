using JanaticsApi.Common.Models;
using JanaticsApi.Domain.Entities;
using JanaticsApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JanaticsApi.Features.Employees.Create;

public static class CreateEmployeeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/", HandleAsync)
            .WithName("CreateEmployee")
            .WithSummary("Create a new employee")
            .Produces<ApiResult<EmployeeDto>>(201)
            .Produces<ApiResult<EmployeeDto>>(400)
            .Produces<ApiResult<EmployeeDto>>(409);
    }

    private static async Task<IResult> HandleAsync(
        CreateEmployeeRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        // Validation
        var errors = Validate(request);
        if (errors.Count > 0)
            return Results.BadRequest(ApiResult<EmployeeDto>.Fail("Validation failed.", errors));

        // Duplicate username check
        var usernameExists = await db.Employees.AnyAsync(e => e.Username == request.Username, ct);
        if (usernameExists)
            return Results.Conflict(
                ApiResult<EmployeeDto>.Fail($"Username '{request.Username}' is already in use."));

        // Department exists check
        var deptExists = await db.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId, ct);
        if (!deptExists)
            return Results.BadRequest(
                ApiResult<EmployeeDto>.Fail($"Department {request.DepartmentId} not found."));

        var now = DateTime.UtcNow;
        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            Password = request.Password,
            Email = request.Email,
            Mobile = request.Mobile,
            Location = request.Location,
            Role = request.Role,
            DepartmentId = request.DepartmentId,
            IsActive = true,
            CreatedOn = now,
            UpdatedOn = now
        };

        db.Employees.Add(employee);
        await db.SaveChangesAsync(ct);

        // Re-fetch with includes
        var created = await db.Employees
            .AsNoTracking()
            .Include(e => e.Department!).ThenInclude(d => d.Hod)
            .FirstAsync(e => e.EmployeeId == employee.EmployeeId, ct);

        return Results.Created(
            $"/api/employees/{created.EmployeeId}",
            ApiResult<EmployeeDto>.Ok(EmployeeMapper.ToDto(created), "Employee created successfully."));
    }

    private static List<string> Validate(CreateEmployeeRequest r)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(r.FirstName))  errors.Add("FirstName is required.");
        if (string.IsNullOrWhiteSpace(r.LastName))   errors.Add("LastName is required.");
        if (string.IsNullOrWhiteSpace(r.Username))   errors.Add("Username is required.");
        if (string.IsNullOrWhiteSpace(r.Password))   errors.Add("Password is required.");
        if (string.IsNullOrWhiteSpace(r.Email))      errors.Add("Email is required.");
        if (string.IsNullOrWhiteSpace(r.Role))       errors.Add("Role is required.");
        if (r.DepartmentId <= 0)                     errors.Add("Valid DepartmentId is required.");
        return errors;
    }
}
