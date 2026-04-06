using FileAccessPortal.Api.Common.Endpoints;
using FileAccessPortal.Api.Common.Middleware;
using FileAccessPortal.Api.Common.Options;
using FileAccessPortal.Api.Common.Persistence;
using FileAccessPortal.Api.Common.Realtime;
using Microsoft.Extensions.Options;

namespace FileAccessPortal.Api.Common.Extensions;

public static class PortalWebApplicationExtensions
{
    public static WebApplication UsePortalApi(this WebApplication app)
    {
        var corsOptions = app.Services.GetRequiredService<IOptions<CorsOptions>>().Value;

        if (!app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        app.UseResponseCompression();
        app.UseOutputCache();
        app.UseRateLimiter();
        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseMiddleware<SecurityHeadersMiddleware>();
        app.UseCors(corsOptions.PolicyName);
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapEndpoints();
        app.MapHub<NotificationHub>("/hubs/notifications");

        return app;
    }

    public static async Task InitializePortalDatabaseAsync(this WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
        await initializer.InitializeAsync();
    }
}
