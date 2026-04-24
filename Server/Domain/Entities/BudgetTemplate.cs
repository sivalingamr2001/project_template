using System.ComponentModel.DataAnnotations;

namespace Server.Domain.Entities;

public class BudgetTemplateEntity : BaseEntity
{
    [Key]
    public int TemplateId { get; set; }

    [Required]
    public  string  Name { get; set; } = string.Empty;

    [Required]
    public string TemplateJson { get; set; } =  string.Empty;
}
