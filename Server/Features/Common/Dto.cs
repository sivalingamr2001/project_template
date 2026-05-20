namespace Server.Features.Common;

public sealed class DepartmentDto
{
    public int DepartmentId { get; set; }
    public string? Name { get; set; }
    public int HodId { get; set; }
    public string? HodName { get; set; }
    public string? HodEmail { get; set; }
    public string? HodEmployeeId { get; set; }
}
