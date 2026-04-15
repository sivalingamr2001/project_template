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
    [Column("employee_id")]
    public int EmployeeId { get; set; }

    // Change to string? because the DB likely contains NULLs
    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    // Even if [Required] in validation, if the DB column is NULL, 
    // it MUST be string? to prevent the Cast Exception during fetch.
    [Column("user_name")]
    [EmailAddress]
    public string? UserName { get; set; }

    [Required]
    [Column("password")]
    public string Password { get; set; } = string.Empty;

    [Column("email")]
    public string? Email { get; set; }

    // Note: If your DB 'mobile' column is a VARCHAR, change this to string?
    // If it's an INT, int? is correct.
    [Column("mobile")]
    public string? Mobile { get; set; }

    [Column("dept_id")]
    public int? DeptId { get; set; }

    [Column("dept_name")]
    public string? DeptName { get; set; }

    [Column("location")]
    public string? Location { get; set; }

    [Column("user_role")]
    public string? UserRole { get; set; }

    [Column("hod_id")]
    public int? HodId { get; set; }

    [Column("hod_name")]
    public string? HodName { get; set; }

    [Column("hod_email")]
    public string? HodEmail { get; set; }

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
