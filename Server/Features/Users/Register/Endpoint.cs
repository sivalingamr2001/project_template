using Server.Application.DTOs;
using Server.Features.Users.Register;

namespace Server.Features.Users.Register;

public static class RegisterEndpoint
{
    public static void MapRegisterEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/register", async (RegisterRequest req, RegisterHandler handler) =>
        {
            var user = await handler.Handle(req);
            return user is not null ? Results.Ok(user) : Results.BadRequest("Email already exists");
        });
    }
}