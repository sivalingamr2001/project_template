using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Infrastructure.Db;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<DepartmentEntity> Departments => Set<DepartmentEntity>();
    public DbSet<AccessRequestEntity> AccessRequests => Set<AccessRequestEntity>();
    public DbSet<AccessItemEntity> AccessItems => Set<AccessItemEntity>();
    public DbSet<AccessApprovalEntity> AccessApprovals => Set<AccessApprovalEntity>();
    public DbSet<AccessReqAuditEntity> AccessReqAudits => Set<AccessReqAuditEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee Configuration
        modelBuilder.Entity<EmployeeEntity>(entity =>
        {
            entity.ToTable("jan_portal_users");
            entity.HasKey(e => e.UserId);

            // Timestamp configurations
            entity.Property(e => e.CreatedOn)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UpdatedOn)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .ValueGeneratedOnAddOrUpdate();

            entity.HasIndex(e => e.UserName).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Department Configuration
        modelBuilder.Entity<DepartmentEntity>(entity =>
        {
            entity.ToTable("jan_department");
            entity.HasKey(d => d.Id);

            // Relationship 2: Department has one Head of Department (HOD)
            entity.HasOne(d => d.HeadOfDepartment)
                  .WithMany() // HOD doesn't necessarily need a collection on the Employee side
                  .HasForeignKey(d => d.DeptHodId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Access Request Configurations
        modelBuilder.Entity<AccessRequestEntity>(entity =>
        {
            entity.ToTable("jan_accessrequest").HasKey(request => request.AccessReqId);
            entity.HasMany(p => p.AccessItems)
                  .WithOne()
                  .HasForeignKey(c => c.AccessReqId);
        });

        modelBuilder.Entity<AccessItemEntity>().ToTable("jan_accessitems").HasKey(item => item.AccessItemId);
        modelBuilder.Entity<AccessApprovalEntity>().ToTable("jan_accessapproval").HasKey(approval => approval.AccessApproveId);
        modelBuilder.Entity<AccessReqAuditEntity>().ToTable("jan_accessreqaudit").HasKey(audit => audit.AuditId);
    }

}
