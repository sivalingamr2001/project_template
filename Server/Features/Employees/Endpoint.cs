using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Server.Domain.Errors;
using Server.Shared.Exceptions;

namespace Server.Features.Employees;

public static class EmployeesEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (EmployeesService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetEmployees")
        .WithOpenApi();

        group.MapGet("/{employeeId:int}", async (int employeeId, EmployeesService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetByIdAsync(employeeId, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetEmployeeById")
        .WithOpenApi();

        group.MapPost("/", async (CreateEmployeeRequest request, EmployeesService service, CancellationToken cancellationToken) =>
        {
            ValidateCreateRequest(request);

            var result = await service.CreateAsync(request, cancellationToken);
            if (!result.IsSuccess)
            {
                return ToProblem(result.Error!);
            }

            return Results.Created($"/api/employees/{result.Value!.EmployeeId}", result.Value);
        })
        .WithName("CreateEmployee")
        .WithOpenApi();

        group.MapPut("/{employeeId:int}", async (int employeeId, UpdateEmployeeRequest request, EmployeesService service, CancellationToken cancellationToken) =>
        {
            ValidateUpdateRequest(request);

            var result = await service.UpdateAsync(employeeId, request, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("UpdateEmployee")
        .WithOpenApi();

        group.MapDelete("/{employeeId:int}", async (int employeeId, EmployeesService service, CancellationToken cancellationToken) =>
        {
            var result = await service.DeleteAsync(employeeId, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : ToProblem(result.Error!);
        })
        .WithName("DeleteEmployee")
        .WithOpenApi();
    }

    private static void ValidateCreateRequest(CreateEmployeeRequest request)
    {
        if (request.EmployeeId <= 0)
        {
            throw new AppValidationException("EmployeeId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new AppValidationException("Name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new AppValidationException("Email is required.");
        }

        if (request.Phone <= 0)
        {
            throw new AppValidationException("Phone is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DepartmentName))
        {
            throw new AppValidationException("Department name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            throw new AppValidationException("Role is required.");
        }
    }

    private static void ValidateUpdateRequest(UpdateEmployeeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new AppValidationException("Name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new AppValidationException("Email is required.");
        }

        if (request.Phone <= 0)
        {
            throw new AppValidationException("Phone is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DepartmentName))
        {
            throw new AppValidationException("Department name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Role))
        {
            throw new AppValidationException("Role is required.");
        }
    }

    private static IResult ToProblem(ServiceError error)
    {
        var statusCode = error.Code switch
        {
            ErrorCode.Validation => StatusCodes.Status400BadRequest,
            ErrorCode.NotFound => StatusCodes.Status404NotFound,
            ErrorCode.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        var title = error.Code switch
        {
            ErrorCode.Validation => "Validation failed",
            ErrorCode.NotFound => "Not found",
            ErrorCode.Conflict => "Conflict",
            _ => "Server error"
        };

        return Results.Problem(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = error.Message
        });
    }
}
