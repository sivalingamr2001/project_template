using Microsoft.EntityFrameworkCore;
using Server.Features.Auth.User;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Auth.Login;

public sealed class LoginService(
    AppDbContext dbContext,
    PasswordHasher passwordHasher)
{
    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Employees
            .AsNoTracking()
            .Where(employee => employee.EmployeeId == request.EmployeeId)
            .Select(employee => new LoginUserProjection(
                employee.EmployeeId,
                employee.Name,
                employee.Email,
                employee.DepartmentId,
                employee.DepartmentName,
                employee.Role,
                employee.PasswordHash,
                employee.PasswordSalt,
                // Find HOD for this department
                dbContext.Employees
                    .Where(h => h.DepartmentId == employee.DepartmentId && h.Role == "Hod")
                    .Select(h => new HodProjection(h.EmployeeId, h.Name, h.Email))
                    .FirstOrDefault()))
            .SingleOrDefaultAsync(cancellationToken);

        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
        {
            return null;
        }

        return new LoginResponse(
           new SessionDto(
               new LoggedInUserDto(
                   user.EmployeeId,
                   user.Name,
                   user.Email,
                   user.DepartmentId,
                   user.DepartmentName,
                   user.Role,
                   user.Hod != null ? new HodDto(user.Hod.EmployeeId, user.Hod.Name, user.Hod.Email) : null)));
    }

    public async Task<UserListResponse> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        var users = await dbContext.Employees
            .AsNoTracking()
            .Select(e => new UserDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Phone, // Ensure this exists in your Entity
                e.DepartmentId,
                e.DepartmentName,
                e.Role,
                dbContext.Employees
                    .Where(h => h.DepartmentId == e.DepartmentId && h.Role == "Hod")
                    .Select(h => new User.HodDto(h.EmployeeId, h.Name, h.Email))
                    .FirstOrDefault()
            ))
            .ToListAsync(cancellationToken);

        return new UserListResponse(users);
    }

    public async Task<UserDto?> GetUserByIdAsync(int employeeId, CancellationToken cancellationToken)
    {
        return await dbContext.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == employeeId)
            .Select(e => new UserDto(
                e.EmployeeId,
                e.Name,
                e.Email,
                e.Phone,
                e.DepartmentId,
                e.DepartmentName,
                e.Role,
                dbContext.Employees
                    .Where(h => h.DepartmentId == e.DepartmentId && h.Role == "Hod")
                    .Select(h => new User.HodDto(h.EmployeeId, h.Name, h.Email))
                    .FirstOrDefault()
            ))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private sealed record LoginUserProjection(
        int EmployeeId,
        string Name,
        string Email,
        int DepartmentId,
        string DepartmentName,
        string Role,
        string PasswordHash,
        string PasswordSalt,
        HodProjection? Hod);

    private sealed record HodProjection(int EmployeeId, string Name, string Email);
}
