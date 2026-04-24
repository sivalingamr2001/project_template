using Server.Common.Realtime;
using Server.Features.ActualAmount;
using Server.Features.Auth.Login;
using Server.Features.BudgetRecords;
using Server.Features.BudgetExport;
using Server.Features.Employees;
using Server.Features.Template;

namespace Server.Api.Config;

public static class EndpointMappingExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Auth");
        LoginEndpoint.Map(authGroup);

        var budgetGroup = app.MapGroup("/api/budgets").WithTags("Budgets");
        BudgetRecordsEndpoint.Map(budgetGroup);
        ActualAmountsEndpoints.Map(budgetGroup);
        BudgetExportEndpoint.Map(budgetGroup);

        var employeeGroup = app.MapGroup("/api/employees").WithTags("Employees");
        EmployeesEndpoint.Map(employeeGroup);

        var templateGroup = app.MapGroup("/api/templates").WithTags("Templates");
        TemplateEndpoint.Map(templateGroup);

        app.MapHub<NotificationHub>("/hubs/notifications");

        return app;
    }
}
