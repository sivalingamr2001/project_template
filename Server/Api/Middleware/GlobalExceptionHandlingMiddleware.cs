using Microsoft.AspNetCore.Mvc;
using Server.Shared.Exceptions;

namespace Server.Api.Middleware;

public sealed class GlobalExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionHandlingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppValidationException exception)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = exception.Message
            });
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception while processing {Path}", context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Server error",
                Detail = "An unexpected error occurred."
            });
        }
    }
}
