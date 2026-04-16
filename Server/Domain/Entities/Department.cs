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
    public int Id { get; set; }

    [Required]
    [Column("dept_id")]
    public int DeptId { get; set; } // Business Dept ID
                                                                                                                                                
    [Required]
    [Column("dept_name")]
    public string DeptName { get; set; } = null!;

    [Required]
    [Column("dept_hod_id")]
    public int DeptHodId { get; set; }

    // Navigation Property: Link to the Employee who is the HOD
    [ForeignKey("DeptHodId")]
    public EmployeeEntity? HeadOfDepartment { get; set; }

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
}
