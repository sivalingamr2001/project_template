namespace Server.Domain.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("jan_portal_users")]
public sealed class EmployeeEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Required]
    [Column("user_name")]
    public string UserName { get; set; } = null!;

    [Required]
    [Column("password")]
    public string Password { get; set; } = null!;

    [Required]
    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("mobile")]
    public string? Mobile { get; set; }

    [Column("dept_id")]
    public int? DeptId { get; set; }

    [Column("dept_name")]
    public string? DeptName { get; set; }

    [Column("location")]
    public string? Location { get; set; }

    [Required]
    [Column("user_role")]
    public string UserRole { get; set; } = null!;

    [Column("hod_id")]
    public int? HodId { get; set; }

    [Column("hod_name")]
    public string? HodName { get; set; }

    [Column("hod_email")]
    public string? HodEmail { get; set; }

    [Column("IsActive")]
    public bool IsActive { get; set; } = true;

    [Column("CreatedOn")]
    public DateTime CreatedOn { get; set; }

    [Column("CreatedBy")]
    public string? CreatedBy { get; set; }

    [Column("UpdatedOn")]
    public DateTime UpdatedOn { get; set; }

    [Column("ModifiedBy")]
    public string? ModifiedBy { get; set; }
}
