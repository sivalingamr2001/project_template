using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Infrastructure.Db;

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

        modelBuilder.Entity<EmployeeEntity>().ToTable("jan_employees").HasKey(employee => employee.EmployeeId);
        modelBuilder.Entity<AccessRequestEntity>().ToTable("jan_accessrequest").HasKey(request => request.AccessReqId);
        modelBuilder.Entity<AccessItemEntity>().ToTable("jan_accessitems").HasKey(item => item.AccessItemId);
        modelBuilder.Entity<AccessApprovalEntity>().ToTable("jan_accessapproval").HasKey(approval => approval.AccessApproveId);
        modelBuilder.Entity<AccessReqAuditEntity>().ToTable("jan_accessreqaudit").HasKey(audit => audit.AuditId);
    }
}
