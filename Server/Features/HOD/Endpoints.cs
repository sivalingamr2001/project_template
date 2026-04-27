using Server.Features.Employees;

namespace Server.Features.HOD;

public class GetHodDetailsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (
            [AsParameters] GetEmployeesQuery query,
            HODService service,
            IConfiguration configuration,
            CancellationToken cancellationToken) =>
        {
            var response = await service.GetHodAsync(query, configuration, cancellationToken);
            return Results.Ok(response);
        })
        .WithName("GetHod")
        .WithOpenApi();
    }
}
