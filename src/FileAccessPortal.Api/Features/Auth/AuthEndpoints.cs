using FileAccessPortal.Api.Common.Auth;
using FileAccessPortal.Api.Common.Endpoints;
using FileAccessPortal.Api.Common.Storage;
using FileAccessPortal.Api.Common.Contracts;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FileAccessPortal.Api.Features.Auth;

public sealed class AuthEndpoints : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapGet("/demo-users", async Task<IResult> (PortalStore store, CancellationToken cancellationToken) =>
        {
            var users = await store.GetUsersAsync(cancellationToken);
            return TypedResults.Ok(users.Select(user => user.ToResponse()).ToArray());
        });

        group.MapPost("/login", async Task<Results<Ok<LoginResponse>, UnauthorizedHttpResult>> (
            LoginRequest request,
            PortalStore store,
            PasswordHasher passwordHasher,
            JwtTokenService jwtTokenService,
            CancellationToken cancellationToken) =>
        {
            var user = await store.GetUserByEmployeeCodeAsync(request.EmployeeCode.Trim(), cancellationToken);
            if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash, user.PasswordSalt))
            {
                return TypedResults.Unauthorized();
            }

            var token = jwtTokenService.CreateToken(user);
            return TypedResults.Ok(new LoginResponse(token, new SessionResponse(user.ToResponse())));
        });
    }

    private sealed record LoginRequest(string EmployeeCode, string Password);

    private sealed record LoginResponse(string AccessToken, SessionResponse Session);
}
