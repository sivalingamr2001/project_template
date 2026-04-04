using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Domain.Enums;

namespace Server.Domain.Entities;

[Table("Jan_Access_Approval")]
public class AccessApproval
{
    [Key]
    public int Id { get; set; }


    [Required]
    public int AccessDetailId { get; set; }


    [ForeignKey(nameof(AccessDetailId))]
    public AccessDetail AccessDetail { get; set; } = null!;


    [Required]
    public int ApproverEmpId { get; set; }  

    [Required]
    [MaxLength(50)]
    public string TypeOfAccessApproved { get; set; } = string.Empty;


    [Required]
    public ApprovalType ApprovalLevel { get; set; }


    [Required]
    [MaxLength(50)]
    public AccessStatus Status { get; set; }


    [MaxLength(1000)]
    public string? Comments { get; set; }

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime ModifiedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string ModifiedBy { get; set; } = string.Empty;
}
