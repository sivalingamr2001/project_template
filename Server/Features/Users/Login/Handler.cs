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
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

        return user is null ? null : new UserResponse(user.Id, user.UserName, user.Email);
    }
}