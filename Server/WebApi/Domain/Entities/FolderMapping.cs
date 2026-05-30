namespace Server.Domain.Entities;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("jan_folder_mappings")]
public sealed class FolderMappingEntity : BaseEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("folder_name")]
    public string FolderName { get; set; } = null!;

    [Column("primary_hod_id")] public string? PrimaryHodId { get; set; }

    [Column("secondary_hod_id")] public string? SecondaryHodId { get; set; }
}
