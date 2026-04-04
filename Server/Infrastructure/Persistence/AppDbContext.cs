using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<AccessRequest> AccessRequests => Set<AccessRequest>();
    public DbSet<AccessDetail> AccessDetails => Set<AccessDetail>();
    public DbSet<AccessApproval> AccessApprovals => Set<AccessApproval>();
    public DbSet<AccessNotification> AccessNotifications => Set<AccessNotification>();
    public DbSet<AccessAuditLog> AccessAuditLogs => Set<AccessAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User configuration
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.EmployeeId)
            .IsUnique();

        // User - Department relationship
        modelBuilder.Entity<User>()
            .HasOne(u => u.Department)
            .WithMany()
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        // Department configuration
        modelBuilder.Entity<Department>()
            .HasIndex(d => d.Name)
            .IsUnique();

        modelBuilder.Entity<Department>()
            .HasOne(d => d.Hod)
            .WithMany()
            .HasForeignKey(d => d.HodId)
            .OnDelete(DeleteBehavior.SetNull);

        // AccessRequest - AccessDetail relationship
        modelBuilder.Entity<AccessRequest>()
            .HasMany(r => r.Details)
            .WithOne(d => d.AccessRequest)
            .HasForeignKey(d => d.AccessRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccessRequest>()
            .HasIndex(r => r.EmpId);

        modelBuilder.Entity<AccessRequest>()
            .HasIndex(r => r.Status);

        // AccessDetail - AccessApproval relationship
        modelBuilder.Entity<AccessDetail>()
            .HasMany(d => d.Approvals)
            .WithOne(a => a.AccessDetail)
            .HasForeignKey(a => a.AccessDetailId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccessDetail>()
            .HasIndex(d => d.AccessRequestId);

        modelBuilder.Entity<AccessDetail>()
            .HasIndex(d => d.Status);

        // AccessApproval indexes
        modelBuilder.Entity<AccessApproval>()
            .HasIndex(a => a.AccessDetailId);

        modelBuilder.Entity<AccessApproval>()
            .HasIndex(a => a.ApproverEmpId);

        modelBuilder.Entity<AccessApproval>()
            .HasIndex(a => a.Status);

        // AccessNotification indexes
        modelBuilder.Entity<AccessNotification>()
            .HasIndex(n => new { n.RecipientEmpId, n.RecipientType, n.CreatedOn });

        modelBuilder.Entity<AccessNotification>()
            .HasIndex(n => n.IsRead);

        // AccessAuditLog indexes
        modelBuilder.Entity<AccessAuditLog>()
            .HasIndex(a => new { a.AccessRequestId, a.CreatedOn });

        modelBuilder.Entity<AccessAuditLog>()
            .HasIndex(a => a.EventType);

        base.OnModelCreating(modelBuilder);
    }
}
