using Microsoft.AspNetCore.Mvc;

namespace Server.Features.Auth.User;

using Server.Shared.Helpers;

public static class GetAllUsersEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/GetAllUsers", async (
            [AsParameters] GetUsersQuery query,
            UserService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetUsersAsync(query, cancellationToken);
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

        group.MapPut("/{userId:int}", async (
            int userId,
            UpdateUserRequest request,
            UserService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdateUserAsync(userId, request, cancellationToken);

                return updated is not null
                    ? Results.Ok(updated)
                    : Results.NotFound(new { Message = $"User with user_id {userId} not found." });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { Message = ex.Message });
            }
        })
        .WithName("UpdateUser")
        .WithOpenApi();

        group.MapPost("/", async (
            CreateUserRequest request,
            UserService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var created = await service.CreateUserAsync(request, cancellationToken);
                return Results.Created($"/api/User/{created.EmployeeId}", created);
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { Message = ex.Message });
            }
        })
        .WithName("CreateUser")
        .WithOpenApi();

        group.MapPut("/{employeeId:int}/password", async (
            int employeeId,
            UpdatePasswordRequest request,
            UserService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdatePasswordAsync(employeeId, request, cancellationToken);
                return updated
                    ? Results.NoContent()
                    : Results.NotFound(new { Message = $"User with ID {employeeId} not found." });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { Message = ex.Message });
            }
        })
        .WithName("UpdateUserPassword")
        .WithOpenApi();
    }
}
