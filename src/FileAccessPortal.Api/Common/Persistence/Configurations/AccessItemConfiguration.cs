using FileAccessPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FileAccessPortal.Api.Common.Persistence.Configurations;

public class AccessItemConfiguration : IEntityTypeConfiguration<AccessItem>
{
    public void Configure(EntityTypeBuilder<AccessItem> builder)
    {
        builder.ToTable("AccessItems");

        builder.HasKey(item => item.AccessItemId);

        builder.Property(item => item.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(item => item.FolderPath)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(item => item.AccessType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(item => item.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(item => item.ResubmissionCount)
            .HasDefaultValue(0);

        builder.Property(item => item.IsActive)
            .HasDefaultValue(true);

        builder.Property(item => item.CreatedOn)
            .IsRequired();

        builder.HasIndex(item => new { item.RequestId, item.IsActive });
        builder.HasIndex(item => new { item.ParentAccessItemId, item.ResubmissionCount });

        builder.HasOne(item => item.Request)
            .WithMany(request => request.AccessItems)
            .HasForeignKey(item => item.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(item => item.ParentAccessItem)
            .WithMany(item => item.Resubmissions)
            .HasForeignKey(item => item.ParentAccessItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(item => item.Reviews)
            .WithOne(review => review.AccessItem)
            .HasForeignKey(review => review.AccessItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
