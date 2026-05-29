using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Configurations
{
    internal class RequisitionConfiguration : IEntityTypeConfiguration<Requisition>
    {
        public void Configure(EntityTypeBuilder<Requisition> builder)
        {
            builder.HasKey(x => x.Id);

            // String properties with Oracle VARCHAR2 types
            builder.Property(x => x.RecNo)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnType("VARCHAR2(50)");

            builder.Property(x => x.PageNo)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnType("VARCHAR2(50)");

            builder.Property(x => x.FromTeam)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.ToTeam)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.ProductNo)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.ProductRev)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnType("VARCHAR2(50)");

            builder.Property(x => x.ProjectNo)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.ProductName)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("VARCHAR2(255)");

            builder.Property(x => x.Purpose)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            // DateTime properties - use TIMESTAMP for Oracle
            builder.Property(x => x.Date)
                .IsRequired()
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.PreparedBy)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.PreparedDate)
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.CheckedBy)
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.CheckedDate)
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.ApprovedBy)
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.ApprovedDate)
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.ReceivedBy)
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.ReceivedDate)
                .HasColumnType("TIMESTAMP");

            // Audit fields - use TIMESTAMP for Oracle
            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.UpdatedAt)
                .HasColumnType("TIMESTAMP");

            builder.Property(x => x.CreatedBy)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            builder.Property(x => x.UpdatedBy)
                .HasMaxLength(100)
                .HasColumnType("VARCHAR2(100)");

            // Numeric properties
            builder.Property(x => x.MonthlyQty)
                .IsRequired()
                .HasColumnType("NUMBER");

            builder.Property(x => x.Status)
                .IsRequired()
                .HasColumnType("NUMBER");

            // Relationships
            builder.HasMany(x => x.Parts)
                .WithOne(x => x.Requisition)
                .HasForeignKey(x => x.RequisitionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
