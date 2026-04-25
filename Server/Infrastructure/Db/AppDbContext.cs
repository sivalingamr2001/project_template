using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using System.Text.Json;

namespace Server.Infrastructure.Db;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetCategory> BudgetCategories => Set<BudgetCategory>();
    public DbSet<BudgetItem> BudgetItems => Set<BudgetItem>();
    public DbSet<BudgetTemplateEntity> BudgetTemplates => Set<BudgetTemplateEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee Configuration
        modelBuilder.Entity<EmployeeEntity>(entity =>
        {
            entity.ToTable("jan_employees");
            entity.HasKey(e => e.EmployeeId);
        });

        // 2. Budget Template Configuration
        modelBuilder.Entity<BudgetTemplateEntity>(entity =>
        {
            entity.ToTable("jan_budget_templates");
            entity.HasKey(e => e.TemplateId);

            // Map the string property to Oracle's CLOB type (JSON stored as text)
            entity.Property(e => e.TemplateJson)
                  .HasColumnType("CLOB");
        });

        // Budget Header
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.ToTable("jan_budgets");
            entity.HasKey(e => e.BudgetId);
            entity.HasIndex(e => e.ProjectNumber).IsUnique();

            // 3. Link Budget to Template (Optional)
            entity.HasOne(b => b.Template)
                  .WithMany()
                  .HasForeignKey(b => b.TemplateId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Budget Categories
        modelBuilder.Entity<BudgetCategory>(entity =>
        {
            entity.ToTable("jan_budget_categories");
            entity.HasKey(e => e.CategoryId);
            entity.Property(e => e.CategoryId).ValueGeneratedOnAdd();

            entity.HasOne(d => d.Budget)
                  .WithMany(p => p.Categories)
                  .HasForeignKey(d => d.BudgetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Budget Items
        modelBuilder.Entity<BudgetItem>(entity =>
        {
            entity.ToTable("jan_budget_items");
            entity.HasKey(e => e.ItemId);
            entity.Property(e => e.ItemId).ValueGeneratedOnAdd();
            entity.Property(e => e.Planned).HasPrecision(18, 2);
            entity.Property(e => e.Actual).HasPrecision(18, 2);

            entity.HasOne(d => d.Category)
                  .WithMany(p => p.Items)
                  .HasForeignKey(d => d.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        SeedBudgetData(modelBuilder);
    }

    private static void SeedBudgetData(ModelBuilder modelBuilder)
    {
        // 4. Define the raw JSON string
        var defaultTemplateJson = @"[
          { ""category"": ""Product Design"", ""items"": [""Benchmarking sample"", ""FEA Analysis"", ""CFD Analysis"", ""Design consultancy"", ""Others""] },
          { ""category"": ""Concept development"", ""items"": [""Comp.devpt-Concept"", ""Machining components"", ""Plastic - Hand moulds"", ""Rubber moulds"", ""3D printing"", ""RPT"", ""MIM"", ""Jigs & fixtures"", ""Concept testing""] },
          { ""category"": ""Prototype development"", ""items"": [""Machining components"", ""Plastic - Inj. moulds"", ""Aluminium - Die casting"", ""Investment casting"", ""Stamping tools"", ""Rubber moulds"", ""Jigs & fixtures"", ""Comp. mfg."", ""Testing""] },
          { ""category"": ""Product testing"", ""items"": [""Testing instruments"", ""Testing fixtures"", ""Certification"", ""Others""] },
          { ""category"": ""Capital equipments"", ""items"": [""Testing equipments"", ""Special machines"", ""Others""] },
          { ""category"": ""Field validation"", ""items"": [""Product development""] }
        ]";

        // 5. Seed the default template with static values
        modelBuilder.Entity<BudgetTemplateEntity>().HasData(new BudgetTemplateEntity
        {
            TemplateId = 1,
            Name = "Standard Product Development Template",
            TemplateJson = defaultTemplateJson,
            CreatedOn = new(2026, 4, 25, 0, 0, 0, DateTimeKind.Utc),
            ModifiedOn = new(2026, 4, 25, 0, 0, 0, DateTimeKind.Utc),
            CreatedBy = "System",
            ModifiedBy = "System"
        });
    }
}
