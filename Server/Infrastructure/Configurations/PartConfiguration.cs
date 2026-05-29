using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Configurations
{
    internal class PartConfiguration : IEntityTypeConfiguration<Part>
    {
        public void Configure(EntityTypeBuilder<Part> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.RequisitionId)
                .IsRequired()
                .HasColumnType("NUMBER(10)");

            builder.Property(x => x.SNo)
                .IsRequired()
                .HasColumnType("NUMBER(10)");

            builder.Property(x => x.PartNo)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.Rev)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnType("VARCHAR2(50)");

            builder.Property(x => x.PartName)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("VARCHAR2(255)");

            builder.Property(x => x.Qty)
                .IsRequired()
                .HasColumnType("NUMBER(10)");

            builder.Property(x => x.RequiredDate)
                .IsRequired()
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.CommittedDate)
                .IsRequired()
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.ActualCompletionDate)
                .HasColumnType("TIMESTAMP");

            // Foreign key relationship
            builder.HasOne(x => x.Requisition)
                .WithMany(x => x.Parts)
                .HasForeignKey(x => x.RequisitionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
