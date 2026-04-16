using System.ComponentModel.DataAnnotations;

namespace Server.Domain.Entities;

public class Budget : BaseEntity
{
    [Key]
    public int BudgetId { get; set; }

    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public string ProjectCode { get; set; } = string.Empty;

    [Required]
    public string ProductNo { get; set; } = string.Empty;

    [Required]
    public string ProjectTitle { get; set; } = string.Empty;

    public ICollection<BudgetCategory> Categories { get; set; } = new List<BudgetCategory>();

    public int IsActive { get; set; } = 1;
}

public class BudgetCategory
{
    [Key]
    public int CategoryId { get; set; }

    public int? BudgetId { get; set; }
    public Budget? Budget { get; set; }

    [Required]
    public string CategoryName { get; set; } = string.Empty;

    public ICollection<BudgetItem> Items { get; set; } = new List<BudgetItem>();
}

public class BudgetItem
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
