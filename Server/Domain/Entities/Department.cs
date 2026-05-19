namespace Server.Domain.Entities;

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("jan_department")]
public sealed class DepartmentEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int DepartmentId { get; set; }

    [Required]
    [Column("dept_name")]
    public string DepartmentName { get; set; } = string.Empty;

    [Required]
    [Column("hod_id")]
    public int HodId { get; set; }

    [ForeignKey(nameof(HodId))]
    public EmployeeEntity? Hod { get; set; }

    // Local authorization DB no longer stores department membership for users.

    [Column("IsActive")]
    public bool IsActive { get; set; } = true;

    [Column("CreatedOn")]
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Column("CreatedBy")]
    public string? CreatedBy { get; set; }

    [Column("UpdatedOn")]
    public DateTime UpdatedOn { get; set; } = DateTime.UtcNow;

    [Column("ModifiedBy")]
    public string? ModifiedBy { get; set; }

    [NotMapped]
    public int Id
    {
        get => DepartmentId;
        set => DepartmentId = value;
    }

    [NotMapped]
    public int DeptId
    {
        get => DepartmentId;
        set => DepartmentId = value;
    }

    [NotMapped]
    public string DeptName
    {
        get => DepartmentName;
        set => DepartmentName = value;
    }

    [NotMapped]
    public int DeptHodId
    {
        get => HodId;
        set => HodId = value;
    }

    [NotMapped]
    public EmployeeEntity? HeadOfDepartment
    {
        get => Hod;
        set => Hod = value;
    }
}
