using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Configurations
{
    internal class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.EmployeeId)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnType("VARCHAR2(50)");

            builder.Property(x => x.FullName)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnType("VARCHAR2(200)");

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnType("VARCHAR2(256)");

            builder.Property(x => x.Password)
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("VARCHAR2(255)");

            builder.Property(x => x.Role)
                .IsRequired()
                .HasColumnType("NUMBER(10)");

            // Audit fields
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
        }
    }
}
