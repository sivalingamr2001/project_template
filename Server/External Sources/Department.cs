namespace JanaticsApi.Domain.Entities;

public class Department
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int? HodId { get; set; }
    public DateTime CreatedOn { get; set; }
    public DateTime UpdatedOn { get; set; }
    public DateTime? ModifiedOn { get; set; }
    public string? ModifiedBy { get; set; }

    // Navigation
    public Employee? Hod { get; set; }
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
