using Microsoft.EntityFrameworkCore;
using Server.Application.DTOs;
using Server.Domain.Entities;
using Server.Features.Users.Register;
using Server.Infrastructure.Persistence;

namespace Server.Features.Users.Register;

public class RegisterHandler(AppDbContext db)
{
    public async Task<UserResponse?> Handle(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return null;

        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email,
            Password = request.Password // In real app, hash password
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return new UserResponse(user.Id, user.UserName, user.Email);
    }
}