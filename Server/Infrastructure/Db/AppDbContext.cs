using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Domain.Enums;

namespace Server.Infrastructure.Db;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetCategory> BudgetCategories => Set<BudgetCategory>();
    public DbSet<BudgetItem> BudgetItems => Set<BudgetItem>();
    public DbSet<BudgetTemplateEntity> BudgetTemplates => Set<BudgetTemplateEntity>();
    public DbSet<BudgetApprovalEntity> BudgetApprovals => Set<BudgetApprovalEntity>();
    public DbSet<BudgetReqAuditEntity> BudgetAudits => Set<BudgetReqAuditEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Employee
        modelBuilder.Entity<EmployeeEntity>(entity => {
            entity.ToTable("jan_employees");
            entity.HasKey(e => e.EmployeeId);
        });

        // 2. Budget Template
        modelBuilder.Entity<BudgetTemplateEntity>(entity => {
            entity.ToTable("jan_budget_templates");
            entity.HasKey(e => e.TemplateId);
            entity.Property(e => e.TemplateJson).HasColumnType("CLOB");
        });

        // 3. Budget Header
        modelBuilder.Entity<Budget>(entity => {
            entity.ToTable("jan_budgets");
            entity.HasKey(e => e.BudgetId);
            entity.HasIndex(e => e.ProjectNumber).IsUnique();

            entity.Property(e => e.Status)
                  .HasConversion<string>()
                  .HasMaxLength(50)
                  .HasDefaultValue(BudgetStatus.Pending);

            entity.HasOne(b => b.Template)
                  .WithMany()
                  .HasForeignKey(b => b.TemplateId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // 4. Budget Categories
        modelBuilder.Entity<BudgetCategory>(entity => {
            entity.ToTable("jan_budget_categories");
            entity.HasKey(e => e.CategoryId);
            entity.HasOne(d => d.Budget)
                  .WithMany(p => p.Categories)
                  .HasForeignKey(d => d.BudgetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 5. Budget Items
        modelBuilder.Entity<BudgetItem>(entity => {
            entity.ToTable("jan_budget_items");
            entity.HasKey(e => e.ItemId);
            entity.Property(e => e.Planned).HasPrecision(18, 2);
            entity.Property(e => e.Actual).HasPrecision(18, 2);

            entity.HasOne(d => d.Category)
                  .WithMany(p => p.Items)
                  .HasForeignKey(d => d.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 6. Budget Approval
        modelBuilder.Entity<BudgetApprovalEntity>(entity => {
            entity.ToTable("jan_budget_approvals");
            entity.HasKey(e => e.BudgetApproveId);
            entity.Property(e => e.ApprovalStatus).HasConversion<string>().HasMaxLength(50);

            entity.HasOne(a => a.Budget)
                  .WithMany(b => b.Approvals)
                  .HasForeignKey(a => a.BudgetId);
        });

        // 7. Budget Audit
        modelBuilder.Entity<BudgetReqAuditEntity>(entity => {
            entity.ToTable("jan_budget_audits");
            entity.HasKey(e => e.AuditId);
            entity.Property(e => e.EventType).HasConversion<string>().HasMaxLength(50);

            entity.HasOne(a => a.Budget)
                  .WithMany(b => b.Audits)
                  .HasForeignKey(a => a.BudgetId);
        });

        SeedBudgetData(modelBuilder);
    }

    private static void SeedBudgetData(ModelBuilder modelBuilder)
    {
        var defaultTemplateJson = @"[
          { ""category"": ""Product Design"", ""items"": [""Benchmarking sample"", ""FEA Analysis"", ""CFD Analysis"", ""Design consultancy"", ""Others""] },
          { ""category"": ""Concept development"", ""items"": [""Comp.devpt-Concept"", ""Machining components"", ""Plastic - Hand moulds"", ""Rubber moulds"", ""3D printing"", ""RPT"", ""MIM"", ""Jigs & fixtures"", ""Concept testing""] },
          { ""category"": ""Prototype development"", ""items"": [""Machining components"", ""Plastic - Inj. moulds"", ""Aluminium - Die casting"", ""Investment casting"", ""Stamping tools"", ""Rubber moulds"", ""Jigs & fixtures"", ""Comp. mfg."", ""Testing""] },
          { ""category"": ""Product testing"", ""items"": [""Testing instruments"", ""Testing fixtures"", ""Certification"", ""Others""] },
          { ""category"": ""Capital equipments"", ""items"": [""Testing equipments"", ""Special machines"", ""Others""] },
          { ""category"": ""Field validation"", ""items"": [""Product development""] }
        ]";

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
