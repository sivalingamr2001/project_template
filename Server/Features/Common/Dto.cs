namespace Server.Features.Common;

public sealed class DepartmentDto
{
    public int DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int HodId { get; set; }

    public HodDto? HOD { get; set; } //users table userId 
}

public sealed class HodDto
{
    public string? HodName { get; set; }
    public string? HodEmail { get; set; }
    public string? HodEmployeeId { get; set; }
}
