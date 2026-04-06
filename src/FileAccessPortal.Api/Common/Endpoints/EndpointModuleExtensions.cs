using System.Reflection;

namespace FileAccessPortal.Api.Common.Endpoints;

public static class EndpointModuleExtensions
{
    public static IEndpointRouteBuilder MapEndpoints(this IEndpointRouteBuilder app)
    {
        var endpointTypes = Assembly.GetExecutingAssembly()
            .DefinedTypes
            .Where(type => type is { IsAbstract: false, IsInterface: false } &&
                           typeof(IEndpointModule).IsAssignableFrom(type))
            .OrderBy(type => type.Name);

        foreach (var endpointType in endpointTypes)
        {
            var endpoint = (IEndpointModule)Activator.CreateInstance(endpointType.AsType())!;
            endpoint.MapEndpoints(app);
        }

        return app;
    }
}
