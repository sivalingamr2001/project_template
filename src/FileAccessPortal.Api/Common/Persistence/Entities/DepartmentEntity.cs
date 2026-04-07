namespace FileAccessPortal.Api.Common.Persistence.Entities;

public sealed class DepartmentEntity
{
    public int DepartmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? HodEmployeeId { get; set; }
}
