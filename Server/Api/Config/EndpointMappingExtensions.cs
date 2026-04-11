using Server.Common.Realtime;
using Server.Features.Auth.Login;
using Server.Features.BudgetRecords;

namespace Server.Api.Config;

public static class EndpointMappingExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Auth");
        LoginEndpoint.Map(authGroup);

        var budgetGroup = app.MapGroup("/api/budgets").WithTags("Budgets");
        BudgetRecordsEndpoint.Map(budgetGroup);

        app.MapHub<NotificationHub>("/hubs/notifications");

        return app;
    }
}
