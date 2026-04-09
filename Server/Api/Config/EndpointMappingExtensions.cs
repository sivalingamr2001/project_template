using Server.Common.Realtime;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetDetails;
using Server.Features.AccessRequests.GetList;
using Server.Features.AccessRequests.Renew;
using Server.Features.AccessRequests.ReviewByHod;
using Server.Features.AccessRequests.ReviewByIt;
using Server.Features.AccessRequests.Revoke;
using Server.Features.AuditLogs.GetList;
using Server.Features.Auth.Login;
using Server.Features.Auth.User;
using Server.Features.Dashboard.GetDashboard;
using Server.Features.Notifications.GetList;
using Server.Features.Notifications.MarkRead;

namespace Server.Api.Config;

public static class EndpointMappingExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Auth");
        LoginEndpoint.Map(authGroup);

        var userGroup = app.MapGroup("/api/User").WithTags("User");
        GetAllUsersEndpoint.Map(userGroup);


        var accessRequestsGroup = app.MapGroup("/api/access-requests").WithTags("Access Requests");
        CreateAccessRequestEndpoint.Map(accessRequestsGroup);
        GetAccessRequestsEndpoint.Map(accessRequestsGroup);
        GetAccessRequestDetailsEndpoint.Map(accessRequestsGroup);
        ReviewAccessRequestByHodEndpoint.Map(accessRequestsGroup);
        ReviewAccessRequestByItEndpoint.Map(accessRequestsGroup);
        RevokeAccessRequestEndpoint.Map(accessRequestsGroup);
        RenewAccessRequestEndpoint.Map(accessRequestsGroup);

        var dashboardGroup = app.MapGroup("/api/dashboard").WithTags("Dashboard");
        GetDashboardEndpoint.Map(dashboardGroup);

        var notificationsGroup = app.MapGroup("/api/notifications").WithTags("Notifications");
        GetNotificationsEndpoint.Map(notificationsGroup);
        MarkNotificationReadEndpoint.Map(notificationsGroup);

        var auditLogsGroup = app.MapGroup("/api/audit-logs").WithTags("Audit Logs");
        GetAuditLogsEndpoint.Map(auditLogsGroup);

        app.MapHub<NotificationHub>("/hubs/notifications");

        return app;
    }
}
