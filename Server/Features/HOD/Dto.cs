namespace Server.Features.HOD;

public class HodResponse
{
    public string EmployeeId { get; set; } = string.Empty;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public int DepartmentId { get; set; }
}
