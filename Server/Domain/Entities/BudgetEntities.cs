using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Server.Domain.Enums;

namespace Server.Domain.Entities;

public class Budget : BaseEntity
{
    [Key]
    public int BudgetId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    public int? TemplateId { get; set; }

    public BudgetTemplateEntity? Template { get; set; }

    [Required]
    public string ProjectNumber { get; set; } = string.Empty;

    [Required]
    public string ProductNo { get; set; } = string.Empty;

    [Required]
    public BudgetStatus Status { get; set; } = BudgetStatus.Pending;

    [Required]
    public string ProjectTitle { get; set; } = string.Empty;

    public ICollection<BudgetCategory> Categories { get; set; } = new List<BudgetCategory>();

    public ICollection<BudgetApprovalEntity> Approvals { get; set; } = new List<BudgetApprovalEntity>();

    public ICollection<BudgetReqAuditEntity> Audits { get; set; } = new List<BudgetReqAuditEntity>();

    public bool IsActive { get; set; } = true;
}

public class BudgetCategory : BaseEntity
{
    [Key]
    public int CategoryId { get; set; }

    public int? BudgetId { get; set; }

    public Budget? Budget { get; set; }

    [Required]
    public string CategoryName { get; set; } = string.Empty;

    public ICollection<BudgetItem> Items { get; set; } = new List<BudgetItem>();
}

public class BudgetItem : BaseEntity
{
    [Key]
    public int ItemId { get; set; }

    public int CategoryId { get; set; }
    public BudgetCategory Category { get; set; } = null!;

    [Required]
    public string ItemName { get; set; } = string.Empty;

    public decimal Planned { get; set; }
    
    public decimal Actual { get; set; }
}

public sealed class BudgetApprovalEntity : BaseEntity
{
    [Key]
    public int BudgetApproveId { get; set; }

    // Link to the Budget being approved
    [Required]
    public int BudgetId { get; set; }

    [ForeignKey("BudgetId")]
    public Budget Budget { get; set; } = null!;

    [Required]
    public int ApproverId { get; set; }

    [Required]
    public BudgetStatus ApprovalStatus { get; set; }

    [MaxLength(500)]
    public string Comments { get; set; } = string.Empty;
}

public sealed class BudgetReqAuditEntity : BaseEntity
{
    [Key]
    public int AuditId { get; set; }

    [Required]
    public int BudgetId { get; set; }

    [ForeignKey("BudgetId")]
    public Budget Budget { get; set; } = null!;

    public int? BudgetApproveId { get; set; }

    [Required]
    [MaxLength(100)]
    public BudgetStatus EventType { get; set; }

    [Required]
    public string Message { get; set; } = string.Empty;

    public int? ActionByUserId { get; set; }

    public bool IsRead { get; set; } = false;
}
