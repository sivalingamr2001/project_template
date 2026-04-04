using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<AccessRequest> AccessRequests => Set<AccessRequest>();
    public DbSet<AccessDetail> AccessDetails => Set<AccessDetail>();
    public DbSet<AccessApproval> AccessApprovals => Set<AccessApproval>();
    public DbSet<AccessNotification> AccessNotifications => Set<AccessNotification>();
    public DbSet<AccessAuditLog> AccessAuditLogs => Set<AccessAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AccessRequest>()
            .HasMany(r => r.Details)
            .WithOne(d => d.AccessRequest)
            .HasForeignKey(d => d.AccessRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccessDetail>()
            .HasMany(d => d.Approvals)
            .WithOne(a => a.AccessDetail)
            .HasForeignKey(a => a.AccessDetailId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AccessDetail>()
            .HasIndex(d => d.AccessRequestId);

        modelBuilder.Entity<AccessApproval>()
            .HasIndex(a => a.AccessDetailId);

        modelBuilder.Entity<AccessApproval>()
            .HasIndex(a => a.ApproverEmpId);

        modelBuilder.Entity<AccessNotification>()
            .HasIndex(n => new { n.RecipientEmpId, n.RecipientType, n.CreatedOn });

        modelBuilder.Entity<AccessAuditLog>()
            .HasIndex(a => new { a.AccessRequestId, a.CreatedOn });

        base.OnModelCreating(modelBuilder);
    }
}
