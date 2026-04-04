using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Features.Users.Login;
using Server.Infrastructure.Persistence;

namespace Server.Features.Users.Login;

public class LoginHandler(AppDbContext db)
{
    public async Task<UserResponse?> Handle(LoginRequest request)
    {
        var user = await db.Users
          .Include(u => u.Department)
          .ThenInclude(d => d!.Hod)
          .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

        if (user is null) return null;

        var hodResponse = user.Department?.Hod is not null
            ? new HodResponse(
                user.Department.Hod.EmployeeId,
                user.Department.Hod.UserName,
                user.Department.Hod.Email)
            : null;

        return new UserResponse(
            user.EmployeeId,
            user.UserName,
            user.Email,
            user.Role,
            user.Location,
            user.DepartmentId,
            user.PhoneNumber,
            user.Department?.Name,
            hodResponse);
      }
}
