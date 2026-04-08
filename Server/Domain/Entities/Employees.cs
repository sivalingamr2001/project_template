using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Domain.Entities;

public sealed class EmployeeEntity
{
    [Key]
    [Column("emp_id")]
    public int EmployeeId { get; set; }

    [Required]
    [Column("full_name", TypeName = "varchar(100)")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("email_address", TypeName = "varchar(255)")]
    public string Email { get; set; } = string.Empty;

    [Column("dept_id")]
    public int DepartmentId { get; set; }

    [Column("dept_name", TypeName = "varchar(50)")]
    public string DepartmentName { get; set; } = string.Empty;

    [Column("user_role", TypeName = "varchar(20)")]
    public string Role { get; set; } = string.Empty;

    [Required]
    [Column("pwd_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [Column("pwd_salt")]
    public string PasswordSalt { get; set; } = string.Empty;
}
