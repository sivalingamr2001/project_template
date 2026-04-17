using JanaticsApi.Common.Models;
using JanaticsApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JanaticsApi.Features.Employees.Update;

public static class UpdateEmployeeEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPut("/{id:int}", HandleAsync)
            .WithName("UpdateEmployee")
            .WithSummary("Update an existing employee")
            .Produces<ApiResult<EmployeeDto>>(200)
            .Produces<ApiResult<EmployeeDto>>(400)
            .Produces<ApiResult<EmployeeDto>>(404);
    }

    private static async Task<IResult> HandleAsync(
        int id,
        UpdateEmployeeRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        var employee = await db.Employees.FindAsync([id], ct);

        if (employee is null)
            return Results.NotFound(
                ApiResult<EmployeeDto>.Fail($"Employee with ID {id} not found."));

        var errors = Validate(request);
        if (errors.Count > 0)
            return Results.BadRequest(ApiResult<EmployeeDto>.Fail("Validation failed.", errors));

        // Verify new department exists
        if (request.DepartmentId != employee.DepartmentId)
        {
            var deptExists = await db.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId, ct);
            if (!deptExists)
                return Results.BadRequest(
                    ApiResult<EmployeeDto>.Fail($"Department {request.DepartmentId} not found."));
        }

        employee.FirstName    = request.FirstName;
        employee.LastName     = request.LastName;
        employee.Email        = request.Email;
        employee.Mobile       = request.Mobile;
        employee.Location     = request.Location;
        employee.Role         = request.Role;
        employee.IsActive     = request.IsActive;
        employee.DepartmentId = request.DepartmentId;
        employee.UpdatedOn    = DateTime.UtcNow;
        employee.ModifiedOn   = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        // Re-fetch with includes
        var updated = await db.Employees
            .AsNoTracking()
            .Include(e => e.Department!).ThenInclude(d => d.Hod)
            .FirstAsync(e => e.EmployeeId == id, ct);

        return Results.Ok(ApiResult<EmployeeDto>.Ok(
            EmployeeMapper.ToDto(updated), "Employee updated successfully."));
    }

    private static List<string> Validate(UpdateEmployeeRequest r)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(r.FirstName)) errors.Add("FirstName is required.");
        if (string.IsNullOrWhiteSpace(r.LastName))  errors.Add("LastName is required.");
        if (string.IsNullOrWhiteSpace(r.Email))     errors.Add("Email is required.");
        if (string.IsNullOrWhiteSpace(r.Role))      errors.Add("Role is required.");
        if (r.DepartmentId <= 0)                    errors.Add("Valid DepartmentId is required.");
        return errors;
    }
}
