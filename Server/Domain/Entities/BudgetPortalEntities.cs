namespace Server.Domain.Entities;
public abstract class BaseEntity
{
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime ModifiedOn { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public string? ModifiedBy { get; set; }
}

public class CategoryEntity : BaseEntity
{
    public int CategoryId { get; set; } // int PK
    public string Name { get; set; } = string.Empty;
    public ICollection<CostItemEntity> CostItems { get; set; } = [];
}

public class CostItemEntity : BaseEntity
{
    public int CostItemId { get; set; } // int PK
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; } // int FK
    public CategoryEntity Category { get; set; } = null!;
}

public class BudgetDataEntity : BaseEntity
{
    public int BudgetDataId { get; set; } // int PK
    public int CostItemId { get; set; } // int FK
    public decimal PlannedAmount { get; set; }
    public decimal ActualAmount { get; set; }
    public CostItemEntity CostItem { get; set; } = null!;
}
