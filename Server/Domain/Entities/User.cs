using System.ComponentModel.DataAnnotations;
using Server.Domain.Enums;

namespace Server.Domain.Entities;

public class User
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public int PhoneNumber { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; } = string.Empty;

    public Roles Role { get; set; }

    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
}
