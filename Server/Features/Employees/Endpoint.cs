namespace Server.Features.Employees;

public static class EmployeesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            [AsParameters] GetEmployeesQuery query,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetEmployeesAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetUsers")
        .WithOpenApi();

        group.MapGet("/{userId:int}", async (
            int userId,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var user = await service.GetEmployeeByIdAsync(userId, cancellationToken);
            return user is null
                ? Results.NotFound(new { Message = $"User with ID {userId} not found." })
                : Results.Ok(user);
        })
        .WithName("GetUserById")
        .WithOpenApi();

        group.MapGet("/department/{departmentId:int}", async (
            int departmentId,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var employees = await service.GetEmployeesByDepartmentAsync(departmentId, cancellationToken);
            return Results.Ok(employees);
        })
        .WithName("GetUsersByDepartment")
        .WithOpenApi();

        group.MapPut("/{userId:int}", async (
            int userId,
            UpdateEmployeeRequest request,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdateEmployeeAsync(userId, request, cancellationToken);
                return updated is null
                    ? Results.NotFound(new { Message = $"User with ID {userId} not found." })
                    : Results.Ok(updated);
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { Message = exception.Message });
            }
        })
        .WithName("UpdateUser")
        .WithOpenApi();

        group.MapDelete("/{userId:int}", async (
            int userId,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var deleted = await service.DeleteEmployeeAsync(userId, cancellationToken);
            return deleted
                ? Results.NoContent()
                : Results.NotFound(new { Message = $"User with ID {userId} not found." });
        })
        .WithName("DeleteUser")
        .WithOpenApi();

        group.MapGet("/Search", async (
        string searchTerm,
        EmployeeService service,
        CancellationToken ct, // Added comma here
        int page = 1,         // Moved inside the parentheses
        int pageSize = 10) => // Moved inside the parentheses
            {
                var result = await service.SearchEmployeesAsync(searchTerm ?? "", ct);
                return Results.Ok(result);
            })
        .WithName("SearchUsers")
        .WithOpenApi();
    }

    public static void MapLegacy(RouteGroupBuilder group)
    {
        group.MapGet("/GetAllUsers", async (
            [AsParameters] GetUsersQuery query,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetLegacyUsersAsync(query, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetAllUsers")
        .WithOpenApi();

        group.MapGet("/{userId:int}", async (
            int userId,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var user = await service.GetLegacyUserByUserIdAsync(userId, cancellationToken);
            return user is null
                ? Results.NotFound(new { Message = $"User with ID {userId} not found." })
                : Results.Ok(user);
        })
        .WithName("GetUserById")
        .WithOpenApi();

        group.MapPost("/", async (
            LegacyCreateUserRequest request,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var created = await service.CreateLegacyUserAsync(request, cancellationToken);
                return Results.Created($"/api/User/{created.UserId}", created);
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { Message = exception.Message });
            }
        })
        .WithName("CreateUser")
        .WithOpenApi();

        group.MapPut("/{userId:int}", async (
            int userId,
            LegacyUpdateUserRequest request,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            try
            {
                var updated = await service.UpdateLegacyUserAsync(userId, request, cancellationToken);
                return updated is null
                    ? Results.NotFound(new { Message = $"User with ID {userId} not found." })
                    : Results.Ok(updated);
            }
            catch (InvalidOperationException exception)
            {
                return Results.BadRequest(new { Message = exception.Message });
            }
        })
        .WithName("UpdateUser")
        .WithOpenApi();

        group.MapPut("/{userId:int}/password", async (
            int userId,
            UpdatePasswordRequest request,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            await service.UpdatePasswordAsync(userId, request.Password, cancellationToken);
            return Results.NoContent();
        })
        .WithName("UpdateUserPassword")
        .WithOpenApi();

        group.MapGet("/Search", async (
            string searchTerm,
            EmployeeService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.SearchEmployeesAsync(searchTerm ?? string.Empty, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("SearchUsersLegacy")
        .WithOpenApi();
    }
}
