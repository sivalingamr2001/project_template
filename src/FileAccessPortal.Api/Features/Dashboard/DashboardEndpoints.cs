using FileAccessPortal.Api.Common.Auth;
using FileAccessPortal.Api.Common.Endpoints;
using FileAccessPortal.Api.Common.Contracts;
using FileAccessPortal.Api.Common.Storage;
using Microsoft.AspNetCore.Authorization;

namespace FileAccessPortal.Api.Features.Dashboard;

public sealed class DashboardEndpoints : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/dashboard").WithTags("Dashboard").RequireAuthorization();

        group.MapGet("/me", async Task<IResult> (HttpContext httpContext, PortalStore store, CancellationToken cancellationToken) =>
        {
            var employeeId = httpContext.User.GetEmployeeId();
            var currentUser = await store.GetUserAsync(employeeId, cancellationToken)
                ?? throw new FileAccessPortal.Api.Common.Errors.NotFoundException("User was not found.");
            var visibleRequests = (await store.GetVisibleRequestsAsync(employeeId, cancellationToken)).Select(request => request.ToResponse()).ToArray();
            var notifications = (await store.GetVisibleNotificationsAsync(employeeId, cancellationToken)).Select(notification => notification.ToResponse()).ToArray();
            var visibleItems = visibleRequests.SelectMany(request => request.Items).ToArray();

            var counts = new DashboardCountsResponse(
                visibleItems.Length,
                visibleItems.Count(item => item.Status == "PendingHodApproval"),
                visibleItems.Count(item => item.Status == "PendingUserResubmission"),
                visibleItems.Count(item => item.Status == "PendingItGrant"),
                visibleItems.Count(item => item.Status == "Granted"),
                visibleItems.Count(item => item.Status == "Revoked"),
                visibleItems.Count(item => item.Status == "Expired"));

            var approvals = new DashboardApprovalsResponse(
                currentUser.Role.ToString() == "Hod"
                    ? visibleItems.Count(item => item.Status == "PendingHodApproval")
                    : 0,
                currentUser.Role.ToString() == "ItTeam"
                    ? visibleItems.Count(item => item.Status == "PendingItGrant")
                    : 0);

            return TypedResults.Ok(new DashboardResponse(
                currentUser.ToResponse(),
                counts,
                approvals,
                visibleRequests.Take(12).ToArray(),
                notifications));
        });
    }
}
