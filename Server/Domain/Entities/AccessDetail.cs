using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Domain.Entities;

[Table("Jan_Access_Details")]
public class AccessDetail
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int AccessRequestId { get; set; }

    [ForeignKey(nameof(AccessRequestId))]
    public AccessRequest AccessRequest { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string FolderPath { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string AccessType { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Reason { get; set; }

    public DateTime? ExpiredAt { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime ModifiedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string ModifiedBy { get; set; } = string.Empty;

    public List<AccessApproval> Approvals { get; set; } = new();
}
