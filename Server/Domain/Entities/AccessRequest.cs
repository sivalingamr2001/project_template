using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Domain.Entities;

[Table("Jan_Access_Request")]
public class AccessRequest
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int EmpId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public bool IsAgreed { get; set; }

    [MaxLength(100)]
    public string? ITSRNumber { get; set; }

    public bool IsRevoke { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime ModifiedOn { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string ModifiedBy { get; set; } = string.Empty;

    public List<AccessDetail> Details { get; set; } = new();
}
