namespace Server.Domain.Entities;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("folder_mappings")]
public sealed class FolderMappingEntity: BaseEntity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("folder_name")]
    public string FolderName { get; set; } = null!;

    [Column("hod_id")]
    public string? HodId { get; set; }

    [Column("hod_name")]
    public string? HodName { get; set; }

    [Column("hod_email")]
    public string? HodEmail { get; set; }
}
