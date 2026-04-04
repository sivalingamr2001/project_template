using Server.Application.DTOs;
using Server.Features.Users.Login;

namespace Server.Features.Users.Login;

public static class LoginEndpoint
{
    public static void MapLoginEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/auth/login", async (LoginRequest req, LoginHandler handler) =>
        {
            var user = await handler.Handle(req);
            return user is not null ? Results.Ok(user) : Results.Unauthorized();
        });
    }
}
