using Server.Common.Realtime;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetDetails;
using Server.Features.AccessRequests.GetList;
using Server.Features.AccessRequests.Renew;
using Server.Features.AccessRequests.Resubmit;
using Server.Features.AccessRequests.ReviewByHod;
using Server.Features.AccessRequests.ReviewByIt;
using Server.Features.AccessRequests.Revoke;
using Server.Features.AuditLogs.GetList;
using Server.Features.Auth.Login;
using Server.Features.Dashboard.GetDashboard;
using Server.Features.Departments.Create;
using Server.Features.Departments.GetList;
using Server.Features.Departments.Update;
using Server.Features.Employees;
using Server.Features.HOD;
using Server.Features.Notifications.GetList;
using Server.Features.Notifications.MarkRead;

namespace Server.Api.Config;

public static class EndpointMappingExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Auth");
        LoginEndpoint.Map(authGroup);

        var employeesGroup = app.MapGroup("/api/employees").WithTags("Employees");
        EmployeesEndpoint.Map(employeesGroup);

        var legacyUsersGroup = app.MapGroup("/api/User").WithTags("Employees");
        EmployeesEndpoint.MapLegacy(legacyUsersGroup);

        var departmentsGroup = app.MapGroup("/api/departments").WithTags("Departments");
        GetDepartmentsEndpoint.Map(departmentsGroup);
        //GetDepartmentHodEndpoint.Map(departmentsGroup);
        CreateDepartmentEndpoint.Map(departmentsGroup);
        UpdateDepartmentEndpoint.Map(departmentsGroup);

        var accessRequestsGroup = app.MapGroup("/api/access-requests").WithTags("Access Requests");
        CreateAccessRequestEndpoint.Map(accessRequestsGroup);
        GetAccessRequestsEndpoint.Map(accessRequestsGroup);
        GetAccessRequestDetailsEndpoint.Map(accessRequestsGroup);
        ReviewAccessRequestByHodEndpoint.Map(accessRequestsGroup);
        ReviewAccessRequestByItEndpoint.Map(accessRequestsGroup);
        RevokeAccessRequestEndpoint.Map(accessRequestsGroup);
        ResubmitAccessItemEndpoint.Map(accessRequestsGroup);
        RenewAccessRequestEndpoint.Map(accessRequestsGroup);

        var dashboardGroup = app.MapGroup("/api/dashboard").WithTags("Dashboard");
        GetDashboardEndpoint.Map(dashboardGroup);

        var notificationsGroup = app.MapGroup("/api/notifications").WithTags("Notifications");
        GetNotificationsEndpoint.Map(notificationsGroup);
        MarkNotificationReadEndpoint.Map(notificationsGroup);

        var auditLogsGroup = app.MapGroup("/api/audit-logs").WithTags("Audit Logs");
        GetAuditLogsEndpoint.Map(auditLogsGroup);

        var hodDetailsGroup = app.MapGroup("/api/hod-details").WithTags("HOD Details");
        GetHodDetailsEndpoint.Map(hodDetailsGroup);

        app.MapHub<NotificationHub>("/hubs/notifications");

        return app;
    }
}
