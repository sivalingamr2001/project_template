using Server.Common.Realtime;
using Server.Features.Auth.Login;

namespace Server.Api.Config;

public static class EndpointMappingExtensions
{
    public static IEndpointRouteBuilder MapFeatureEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Auth");
        LoginEndpoint.Map(authGroup);

        app.MapHub<NotificationHub>("/hubs/notifications");

        return app;
    }
}
