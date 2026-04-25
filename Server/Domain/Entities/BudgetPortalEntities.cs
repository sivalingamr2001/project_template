namespace Server.Domain.Entities;
public abstract class BaseEntity
{
    public DateTime CreatedOn { get; set; } = new(2026, 4, 25, 0, 0, 0, DateTimeKind.Utc);
    public DateTime ModifiedOn { get; set; } = new(2026, 4, 25, 0, 0, 0, DateTimeKind.Utc);
    public string? CreatedBy { get; set; }
    public string? ModifiedBy { get; set; }
}

