namespace Server.Domain.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Domain.Enums;

[Table("jan_portal_users")]
public sealed class EmployeeEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("employee_id")]
    public string? EmployeeId { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("user_role")]
    public UserRole? UserRole { get; set; }

    [Column("location")]
    public string? Location { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_on")]
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Column("updated_on")]
    public DateTime UpdatedOn { get; set; } = DateTime.UtcNow;
}
