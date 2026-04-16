using Server.Shared.Constants;

namespace Server.Features.Departments.GetList;

public static class GetDepartmentsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", () =>
        {
            var departments = DepartmentCatalog.All
                .OrderBy(kvp => kvp.Key)
                .Select(kvp => new DepartmentDto(kvp.Key, kvp.Value))
                .ToList();

            return Results.Ok(new DepartmentListResponse(departments));
        })
        .WithName("GetDepartments")
        .WithOpenApi();
    }
}

public sealed record DepartmentDto(int Id, string Name);

public sealed record DepartmentListResponse(IReadOnlyList<DepartmentDto> Departments);
