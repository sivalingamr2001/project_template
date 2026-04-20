using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Auth.Login;

public static class LoginEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/login", async Task<Results<Ok<LoginResponse>, UnauthorizedHttpResult>> (
            [FromBody] LoginRequest request,
            LoginService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.AuthenticateAsync(request, cancellationToken);

            return response is null
                ? TypedResults.Unauthorized()
                : TypedResults.Ok(response);
        })
        .WithName("Login")
        .WithOpenApi();
    }
}
