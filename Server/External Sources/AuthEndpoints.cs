using JanaticsApi.Common.Models;
using JanaticsApi.Domain.Entities;
using JanaticsApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JanaticsApi.Features.Auth;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register", RegisterAsync)
            .WithName("Register")
            .WithSummary("Register a new employee account")
            .Produces<ApiResult<AuthResponse>>(201)
            .Produces<ApiResult<AuthResponse>>(400)
            .Produces<ApiResult<AuthResponse>>(409);

        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .WithSummary("Authenticate and retrieve user info")
            .Produces<ApiResult<AuthResponse>>(200)
            .Produces<ApiResult<AuthResponse>>(401);

        return group;
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(
                ApiResult<AuthResponse>.Fail("Username, Password, and Email are required."));
        }

        // Check duplicate username
        var exists = await db.Employees.AnyAsync(e => e.Username == request.Username, ct);
        if (exists)
        {
            return Results.Conflict(
                ApiResult<AuthResponse>.Fail($"Username '{request.Username}' is already taken."));
        }

        // Verify department exists
        var deptExists = await db.Departments.AnyAsync(d => d.DepartmentId == request.DepartmentId, ct);
        if (!deptExists)
        {
            return Results.BadRequest(
                ApiResult<AuthResponse>.Fail($"Department {request.DepartmentId} does not exist."));
        }

        var now = DateTime.UtcNow;
        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Username = request.Username,
            Password = request.Password, // Plain text as per spec
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

        var response = new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email);

        return Results.Created($"/api/employees/{employee.EmployeeId}",
            ApiResult<AuthResponse>.Ok(response, "Registration successful."));
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        AppDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(
                ApiResult<AuthResponse>.Fail("Username and Password are required."));
        }

        var employee = await db.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(
                e => e.Username == request.Username && e.Password == request.Password && e.IsActive,
                ct);

        if (employee is null)
        {
            return Results.Unauthorized();
        }

        var response = new AuthResponse(
            employee.EmployeeId,
            employee.Username,
            $"{employee.FirstName} {employee.LastName}",
            employee.Role,
            employee.Email);

        return Results.Ok(ApiResult<AuthResponse>.Ok(response, "Login successful."));
    }
}
