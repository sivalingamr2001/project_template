using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Domain.Entities;

[Table("Jan_Access_Notification")]
public class AccessNotification
{
    [Key]
    public int Id { get; set; }

    public int? AccessRequestId { get; set; }

    public int? AccessDetailId { get; set; }

    public int? AccessApprovalId { get; set; }

    public int? RecipientEmpId { get; set; }

    [Required]
    [MaxLength(50)]
    public string RecipientType { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
}
