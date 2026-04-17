using JanaticsApi.Common.Models;
using JanaticsApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JanaticsApi.Features.Employees.Get;

public static class GetEmployeesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        // Get all with pagination
        group.MapGet("/", HandleListAsync)
            .WithName("GetEmployees")
            .WithSummary("Get all employees with pagination")
            .Produces<ApiResult<PagedResult<EmployeeDto>>>(200);

        // Get by ID
        group.MapGet("/{id:int}", HandleGetByIdAsync)
            .WithName("GetEmployeeById")
            .WithSummary("Get employee by ID including department and HOD details")
            .Produces<ApiResult<EmployeeDto>>(200)
            .Produces<ApiResult<EmployeeDto>>(404);
    }

    // ── GET /api/employees?pageNumber=1&pageSize=10 ───────────────────────────

    private static async Task<IResult> HandleListAsync(
        [AsParameters] PagedQuery query,
        AppDbContext db,
        CancellationToken ct)
    {
        query.Normalize();

        var totalCount = await db.Employees.CountAsync(ct);

        var employees = await db.Employees
            .AsNoTracking()
            .Include(e => e.Department!).ThenInclude(d => d.Hod)
            .OrderBy(e => e.EmployeeId)
            .Skip(query.Skip)
            .Take(query.PageSize)
            .ToListAsync(ct);

        var result = new PagedResult<EmployeeDto>
        {
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize,
            Data = employees.Select(EmployeeMapper.ToDto)
        };

        return Results.Ok(ApiResult<PagedResult<EmployeeDto>>.Ok(result));
    }

    // ── GET /api/employees/{id} ───────────────────────────────────────────────

    private static async Task<IResult> HandleGetByIdAsync(
        int id,
        AppDbContext db,
        CancellationToken ct)
    {
        var employee = await db.Employees
            .AsNoTracking()
            .Include(e => e.Department!).ThenInclude(d => d.Hod)
            .FirstOrDefaultAsync(e => e.EmployeeId == id, ct);

        if (employee is null)
            return Results.NotFound(
                ApiResult<EmployeeDto>.Fail($"Employee with ID {id} not found."));

        return Results.Ok(ApiResult<EmployeeDto>.Ok(EmployeeMapper.ToDto(employee)));
    }
}
