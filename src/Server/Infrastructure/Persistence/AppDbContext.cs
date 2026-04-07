using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<AccessRequestEntity> AccessRequests => Set<AccessRequestEntity>();
    public DbSet<AccessItemEntity> AccessItems => Set<AccessItemEntity>();
    public DbSet<AccessApprovalEntity> AccessApprovals => Set<AccessApprovalEntity>();
    public DbSet<AccessReqAuditEntity> AccessReqAudits => Set<AccessReqAuditEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EmployeeEntity>().ToTable("jan_employees");
        modelBuilder.Entity<AccessRequestEntity>().ToTable("jan_accessrequest");
        modelBuilder.Entity<AccessItemEntity>().ToTable("jan_accessitems");
        modelBuilder.Entity<AccessApprovalEntity>().ToTable("jan_accessapproval");
        modelBuilder.Entity<AccessReqAuditEntity>().ToTable("jan_accessreqaudit");

        modelBuilder.Entity<EmployeeEntity>().HasKey(e => e.EmployeeId);
        modelBuilder.Entity<AccessRequestEntity>().HasKey(e => e.AccessReqId);
        modelBuilder.Entity<AccessItemEntity>().HasKey(e => e.AccessItemId);
        modelBuilder.Entity<AccessApprovalEntity>().HasKey(e => e.AccessApproveId);
        modelBuilder.Entity<AccessReqAuditEntity>().HasKey(e => e.AuditId);
    }
}
