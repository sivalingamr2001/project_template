using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Server.Features.AccessRequests.Common;
using Server.Features.Auth.Login;

namespace Server.Features.Auth.User;

public static class GetAllUsersEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/GetAllUsers", async (
            UserService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetAllUsersAsync(cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetAllUsers")
        .WithOpenApi();

        group.MapGet("/{employeeId:int}", async (
            int employeeId,
            UserService service,
            CancellationToken cancellationToken) =>
        {
            var user = await service.GetUserByIdAsync(employeeId, cancellationToken);

            return user is not null
                ? Results.Ok(user)
                : Results.NotFound(new { Message = $"User with ID {employeeId} not found." });
        })
        .WithName("GetUserById")
        .WithOpenApi();
    }
}
