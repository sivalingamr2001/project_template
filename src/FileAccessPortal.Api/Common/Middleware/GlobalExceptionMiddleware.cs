using System.Text.Json;
using FileAccessPortal.Api.Common.Errors;
using Microsoft.AspNetCore.Mvc;

namespace FileAccessPortal.Api.Common.Middleware;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException exception)
        {
            logger.LogWarning(exception, "Handled application exception for {Path}", context.Request.Path);
            await WriteProblemAsync(context, exception.StatusCode, exception.Message, "Application error");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled exception for {Path}", context.Request.Path);
            var detail = environment.IsDevelopment()
                ? exception.ToString()
                : "An unexpected error occurred.";
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, detail, "Server error");
        }
    }

    private static async Task WriteProblemAsync(HttpContext context, int statusCode, string detail, string title)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Title = title,
            Detail = detail,
            Status = statusCode,
            Instance = context.Request.Path
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
