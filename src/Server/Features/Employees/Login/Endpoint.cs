using Microsoft.AspNetCore.Http.HttpResults;
using Server.Common.Auth;
using Server.Application.DTOs;
using Server.Common.Contracts;
using FileAccessPortal.Api.Common.Contracts;

namespace Server.Features.Users.Login;

public static class LoginEndpoint
{
    public static void MapLoginEndpoint(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async Task<Results<Ok<LoginResponse>, UnauthorizedHttpResult>> (
            LoginRequest request,
            LoginHandler handler,
            PasswordHasher passwordHasher,
            CancellationToken cancellationToken) =>
        {
            var user = await handler.Handle(request.EmployeeId, cancellationToken);
            if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return TypedResults.Unauthorized();
            }

            return TypedResults.Ok(new LoginResponse(new SessionResponse(user.ToResponse())));
        });
    }
}
