using JanaticsApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JanaticsApi.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Employee ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Employee>(e =>
        {
            e.ToTable("Jan_Emp_Mast");
            e.HasKey(x => x.EmployeeId);

            e.Property(x => x.EmployeeId).ValueGeneratedOnAdd();
            e.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
            e.Property(x => x.LastName).IsRequired().HasMaxLength(100);
            e.Property(x => x.Username).IsRequired().HasMaxLength(50);
            e.Property(x => x.Password).IsRequired().HasMaxLength(255);
            e.Property(x => x.Email).IsRequired().HasMaxLength(150);
            e.Property(x => x.Mobile).HasMaxLength(20);
            e.Property(x => x.Location).HasMaxLength(200);
            e.Property(x => x.Role).IsRequired().HasMaxLength(50);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedOn).IsRequired();
            e.Property(x => x.UpdatedOn).IsRequired();
            e.Property(x => x.ModifiedBy).HasMaxLength(100);

            // Unique index on Username
            e.HasIndex(x => x.Username).IsUnique();

            // Employee → Department (many-to-one)
            // Restrict delete so we cannot delete a department that still has employees
            e.HasOne(x => x.Department)
             .WithMany(d => d.Employees)
             .HasForeignKey(x => x.DepartmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Department ────────────────────────────────────────────────────────
        modelBuilder.Entity<Department>(d =>
        {
            d.ToTable("Jan_Department");
            d.HasKey(x => x.DepartmentId);

            d.Property(x => x.DepartmentId).ValueGeneratedOnAdd();
            d.Property(x => x.DepartmentName).IsRequired().HasMaxLength(150);
            d.Property(x => x.ModifiedBy).HasMaxLength(100);
            d.Property(x => x.CreatedOn).IsRequired();
            d.Property(x => x.UpdatedOn).IsRequired();

            // Department → HOD (optional; self-referencing through Employee table)
            d.HasOne(x => x.Hod)
             .WithMany()
             .HasForeignKey(x => x.HodId)
             .OnDelete(DeleteBehavior.SetNull)
             .IsRequired(false);
        });
    }
}
