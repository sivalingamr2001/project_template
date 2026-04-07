using FileAccessPortal.Api.Common.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace FileAccessPortal.Api.Common.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<DepartmentEntity> Departments => Set<DepartmentEntity>();
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<AccessRequestEntity> Requests => Set<AccessRequestEntity>();
    public DbSet<AccessItemEntity> AccessItems => Set<AccessItemEntity>();
    public DbSet<ApprovalEntity> Approvals => Set<ApprovalEntity>();
    public DbSet<AuditLogEntity> AuditLogs => Set<AuditLogEntity>();
    public DbSet<NotificationEntity> Notifications => Set<NotificationEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<DepartmentEntity>(entity =>
        {
            entity.ToTable("Departments");
            entity.HasKey(x => x.DepartmentId);
            entity.Property(x => x.Name).HasMaxLength(128);
        });

        modelBuilder.Entity<EmployeeEntity>(entity =>
        {
            entity.ToTable("Employees");
            entity.HasKey(x => x.EmployeeId);
            entity.HasIndex(x => x.EmployeeCode).IsUnique();
            entity.Property(x => x.EmployeeCode).HasMaxLength(32);
            entity.Property(x => x.Name).HasMaxLength(128);
            entity.Property(x => x.Email).HasMaxLength(256);
            entity.Property(x => x.Role).HasMaxLength(32);
        });

        modelBuilder.Entity<AccessRequestEntity>(entity =>
        {
            entity.ToTable("AccessRequests");
            entity.HasKey(x => x.RequestId);
            entity.HasIndex(x => x.TicketNumber).IsUnique();
            entity.Property(x => x.TicketNumber).HasMaxLength(32);
            entity.Property(x => x.AggregateStatus).HasMaxLength(64);
            entity.Property(x => x.RequestedByName).HasMaxLength(128);
            entity.Property(x => x.DepartmentName).HasMaxLength(128);
            entity.Property(x => x.CamundaBusinessKey).HasMaxLength(128);
            entity.Property(x => x.CamundaProcessInstanceId).HasMaxLength(128);
            entity.Property(x => x.CamundaLastAction).HasMaxLength(128);
        });

        modelBuilder.Entity<AccessItemEntity>(entity =>
        {
            entity.ToTable("AccessItems");
            entity.HasKey(x => x.AccessItemId);
            entity.Property(x => x.FileName).HasMaxLength(255);
            entity.Property(x => x.FolderPath).HasColumnType("TEXT");
            entity.Property(x => x.AccessType).HasMaxLength(50);
            entity.Property(x => x.BusinessReason).HasMaxLength(1000);
            entity.Property(x => x.Status).HasMaxLength(64);
            entity.Property(x => x.RevokeReason).HasMaxLength(500);
            entity.Property(x => x.RejectionReason).HasMaxLength(500);
            entity.Property(x => x.RejectedByStage).HasMaxLength(32);
            entity.Property(x => x.HodReviewerName).HasMaxLength(128);
            entity.Property(x => x.HodNote).HasMaxLength(500);
            entity.Property(x => x.ItReviewerName).HasMaxLength(128);
            entity.Property(x => x.ItNote).HasMaxLength(500);
            entity.HasIndex(x => new { x.RequestId, x.IsLatest, x.Status });
            entity.HasIndex(x => new { x.Status, x.IsLatest });
            entity.HasIndex(x => new { x.RequestId, x.FolderPath, x.FileName, x.IsLatest });
        });

        modelBuilder.Entity<ApprovalEntity>(entity =>
        {
            entity.ToTable("Approvals");
            entity.HasKey(x => x.ApprovalId);
            entity.Property(x => x.Stage).HasMaxLength(32);
            entity.Property(x => x.Decision).HasMaxLength(32);
            entity.Property(x => x.Note).HasMaxLength(500);
            entity.HasIndex(x => new { x.AccessItemId, x.Stage }).IsUnique();
        });

        modelBuilder.Entity<AuditLogEntity>(entity =>
        {
            entity.ToTable("AuditLog");
            entity.HasKey(x => x.AuditId);
            entity.Property(x => x.Stage).HasMaxLength(32);
            entity.Property(x => x.EventType).HasMaxLength(64);
            entity.Property(x => x.Message).HasColumnType("TEXT");
            entity.Property(x => x.ActorName).HasMaxLength(128);
            entity.HasIndex(x => new { x.RequestId, x.HappenedAtUtc });
        });

        modelBuilder.Entity<NotificationEntity>(entity =>
        {
            entity.ToTable("Notifications");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.RecipientEmployeeId, x.CreatedAtUtc });
            entity.Property(x => x.RecipientName).HasMaxLength(128);
            entity.Property(x => x.RecipientStage).HasMaxLength(32);
            entity.Property(x => x.EventType).HasMaxLength(64);
            entity.Property(x => x.Message).HasMaxLength(1000);
        });
    }
}
