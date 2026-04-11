namespace Server.Domain.Entities;
public abstract class BaseEntity
{
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime ModifiedOn { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public string? ModifiedBy { get; set; }
}

