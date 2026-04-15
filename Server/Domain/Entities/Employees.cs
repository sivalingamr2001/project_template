namespace Server.Domain.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("jan_portal_users")]
public sealed class EmployeeEntity
{
    [Column("user_id")]
    public int UserId { get; set; }

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("first_name", TypeName = "varchar(150)")]
    public string FirstName { get; set; } = string.Empty;

    [Column("last_name", TypeName = "varchar(150)")]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [Column("user_name", TypeName = "varchar(150)")]
    [EmailAddress]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [Column("password", TypeName = "varchar(255)")]
    public string Password { get; set; } = string.Empty;

    [Column("email", TypeName = "varchar(100)")]
    public string Email { get; set; } = string.Empty;

    [Column("mobile", TypeName = "varchar(20)")]
    public string Mobile { get; set; } = string.Empty;

    [Column("dept_id")]
    public int? DeptId { get; set; }

    [Column("dept_name", TypeName = "varchar(100)")]
    public string DeptName { get; set; } = string.Empty;

    [Column("location", TypeName = "varchar(100)")]
    public string Location { get; set; } = string.Empty;

    [Column("user_role", TypeName = "varchar(100)")]
    public string UserRole { get; set; } = string.Empty;

    [Column("hod_id")]
    public int? HodId { get; set; }

    [Column("hod_name", TypeName = "varchar(150)")]
    public string? HodName { get; set; } = string.Empty;

    [Column("hod_email", TypeName = "varchar(100)")]
    public string? HodEmail { get; set; } = string.Empty;

    [Column("IsActive")]
    public bool IsActive { get; set; } = true;

    [Column("CreatedOn")]
    public DateTime CreatedOn { get; set; } = DateTime.Now;

    [Column("CreatedBy")]
    public int CreatedBy { get; set; }

    [Column("UpdatedOn")]
    public DateTime? UpdatedOn { get; set; }

    [Column("ModifiedBy")]
    public int? ModifiedBy { get; set; }
}
