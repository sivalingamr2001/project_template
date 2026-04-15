using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Domain.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("jan_portal_users")]
public sealed class EmployeeEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [Column("employee_id")]
    public string EmployeeId { get; set; } = string.Empty;

    [Required]
    [Column("full_name", TypeName = "varchar(150)")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [Column("email", TypeName = "varchar(100)")]
    public string Email { get; set; } = string.Empty;

    [Column("mobile", TypeName = "varchar(20)")]
    public string Mobile { get; set; } = string.Empty;

    [Column("dept_id")]
    public string DeptId { get; set; } = string.Empty;

    [Column("dept_name", TypeName = "varchar(100)")]
    public string DeptName { get; set; } = string.Empty;

    [Column("location", TypeName = "varchar(100)")]
    public string Location { get; set; } = string.Empty;

    [Column("user_role", TypeName = "varchar(100)")]
    public string UserRole { get; set; } = string.Empty;

    [Column("hod_id")]
    public string HodId { get; set; } = string.Empty;

    [Column("hod_name", TypeName = "varchar(150)")]
    public string HodName { get; set; } = string.Empty;

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

