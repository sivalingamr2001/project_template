using FileAccessPortal.Api.Common.Auth;
using FileAccessPortal.Api.Common.Contracts;
using FileAccessPortal.Api.Common.Endpoints;
using FileAccessPortal.Api.Common.Storage;
using Microsoft.AspNetCore.Authorization;

namespace FileAccessPortal.Api.Features.Notifications;

public sealed class NotificationEndpoints : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notifications").WithTags("Notifications").RequireAuthorization();

        group.MapGet("/me", async Task<IResult> (HttpContext httpContext, PortalStore store, CancellationToken cancellationToken) =>
        {
            var employeeId = httpContext.User.GetEmployeeId();
            var notifications = await store.GetVisibleNotificationsAsync(employeeId, cancellationToken);
            return TypedResults.Ok(notifications
                .Select(notification => notification.ToResponse())
                .ToArray());
        });
    }
}
