using Dapper;
using Grpc.Core;
using MySqlConnector;
using Server.Shared.Constants;

namespace Server.Features.Departments.GetHodList;

public static class GetDepartmentHodEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/GetHod", async (IConfiguration configuration) =>
        {
            // 1. Get the specific HOD connection string
            var hodConnectionString = configuration.GetValue<string>("Database:MySqlConnectionString_HOD");

            if (string.IsNullOrEmpty(hodConnectionString))
            {
                return Results.Problem("HOD Connection string is missing.");
            }

            try
            {
                // 2. Open connection to the SECOND database
                using var connection = new MySqlConnection(hodConnectionString);

                // 3. Query the external database directly
                // Note: Change 'jan_hod' and column names if they differ in the HOD database
                var query = @"
                    SELECT 
                        id_row,
                        id,
                        hodname,
                        employee_number,
                        employee_name,
                        Email_ID,
                        Mob_no,
                        hod_id,
                        status,
                        deleted
                    FROM hod_master 
                    WHERE deleted = 0";

                var hodRecords = await connection.QueryAsync<DepartmentDto>(query);

                return Results.Ok(new DepartmentListResponse(hodRecords.ToList()));
            }
            catch (Exception ex)
            {
                // Log the error (inject ILogger if needed)
                return Results.Problem($"Failed to fetch from HOD database: {ex.Message}");
            }
        })
        .WithName("GetDepartmentsHod")
        .WithOpenApi();
    }
}

public class DepartmentDto
{
    public DepartmentDto() { }

    // Primary Key from DB (int)
    public int id_row { get; set; }

    // Table 'id' is varchar(45), mapping to string
    public string? id { get; set; }

    public string? hodname { get; set; }

    // Nullable varchar(10)
    public string? employee_number { get; set; }

    // Nullable varchar(100)
    public string? employee_name { get; set; }

    // Nullable varchar(255)
    public string? Email_ID { get; set; }

    // Nullable varchar(20)
    public string? Mob_no { get; set; }

    public string? hod_id { get; set; }

    // varchar(1)
    public string? status { get; set; }

    // int unsigned in DB
    public uint deleted { get; set; }
}
public sealed record DepartmentListResponse(IReadOnlyList<DepartmentDto> Departments);
