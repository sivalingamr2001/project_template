using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Auth.Login;

public sealed class LoginService(
    AppDbContext dbContext,
    PasswordHasher passwordHasher)
{
    public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.GetIdentifier().Trim();

        if (string.IsNullOrEmpty(identifier))
        {
            return null;
        }

        var isEmail = identifier.Contains("@");
        var isNumber = int.TryParse(identifier, out var employeeId);

        var user = await dbContext.Employees
            .AsNoTracking()
            .Where(e =>
                (isEmail && e.Email == identifier) ||
                (isNumber && e.EmployeeId == employeeId) ||
                (!isEmail && !isNumber && e.Name == identifier)) // Name = Username
            .Select(employee => new LoginUserProjection(
                employee.EmployeeId,
                employee.Name,
                employee.Email,
                employee.DepartmentId,
                employee.DepartmentName,
                employee.TeamName,
                employee.Role,
                employee.PasswordHash,
                employee.PasswordSalt,
                dbContext.Employees
                    .Where(h => h.DepartmentId == employee.DepartmentId && h.Role == "Hod")
                    .Select(h => new HodProjection(h.EmployeeId, h.Name, h.Email))
                    .FirstOrDefault()))
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(request.Password) ||
            user is null ||
            !passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
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
                    user.TeamName,
                    user.Role,
                    user.Hod != null
                        ? new HodDto(user.Hod.EmployeeId, user.Hod.Name, user.Hod.Email)
                        : null)));
    }

    private sealed record LoginUserProjection(
        int EmployeeId,
        string Name,
        string Email,
        int DepartmentId,
        string DepartmentName,
        string TeamName,
        string Role,
        string PasswordHash,
        string PasswordSalt,
        HodProjection? Hod);

    private sealed record HodProjection(int EmployeeId, string Name, string Email);
}
