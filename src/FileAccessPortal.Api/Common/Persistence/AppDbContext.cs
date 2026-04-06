using FileAccessPortal.Api.Common.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace FileAccessPortal.Api.Common.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<RequestDocumentEntity> Requests => Set<RequestDocumentEntity>();
    public DbSet<NotificationEntity> Notifications => Set<NotificationEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EmployeeEntity>(entity =>
        {
            entity.HasKey(x => x.EmployeeId);
            entity.HasIndex(x => x.EmployeeCode).IsUnique();
            entity.Property(x => x.EmployeeCode).HasMaxLength(32);
            entity.Property(x => x.Name).HasMaxLength(128);
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.Role).HasMaxLength(32);
        });

        modelBuilder.Entity<RequestDocumentEntity>(entity =>
        {
            entity.HasKey(x => x.RequestId);
            entity.HasIndex(x => x.TicketNumber).IsUnique();
            entity.Property(x => x.TicketNumber).HasMaxLength(32);
            entity.Property(x => x.AggregateStatus).HasMaxLength(64);
            entity.Property(x => x.JsonContent).HasColumnType("TEXT");
            entity.Property(x => x.CamundaBusinessKey).HasMaxLength(128);
            entity.Property(x => x.CamundaProcessInstanceId).HasMaxLength(128);
            entity.Property(x => x.CamundaLastAction).HasMaxLength(128);
        });

        modelBuilder.Entity<NotificationEntity>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.RecipientEmployeeId, x.CreatedAtUtc });
            entity.Property(x => x.RecipientName).HasMaxLength(128);
            entity.Property(x => x.RecipientStage).HasMaxLength(32);
            entity.Property(x => x.EventType).HasMaxLength(64);
            entity.Property(x => x.Message).HasMaxLength(1000);
        });
    }
}
