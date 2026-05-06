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

            // Fix for ORA-00936: Map bool to NUMBER(1)
            entity.Property(e => e.IsActive)
                  .HasColumnType("NUMBER(1)")
                  .HasConversion(
                      v => v ? 1 : 0, // C# to DB
                      v => v == 1     // DB to C#
                  );

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

            // Primary Key: Ensure this is 'int' in C# to match NUMBER(10)
            entity.HasKey(e => e.AuditId);
            entity.Property(e => e.AuditId)
                  .ValueGeneratedOnAdd();

            // Mapping for Boolean/Checkbox field
            entity.Property(e => e.IsRead)
                  .HasColumnName("IsRead")
                  .HasColumnType("NUMBER(1)")
                  .HasConversion<int>();

            // Mapping for EventType
            entity.Property(e => e.EventType)
                  .HasConversion<string>()
                  .HasMaxLength(50);

            // Ensure Base Entity fields match the database casing
            entity.Property(e => e.CreatedOn).HasColumnName("CreatedOn");
            entity.Property(e => e.ModifiedOn).HasColumnName("ModifiedOn");
            entity.Property(e => e.CreatedBy).HasColumnName("CreatedBy");
            entity.Property(e => e.ModifiedBy).HasColumnName("ModifiedBy");

            // Foreign Key Relationships
            entity.HasOne(a => a.Budget)
                  .WithMany(b => b.Audits)
                  .HasForeignKey(a => a.BudgetId);
        });

        SeedBudgetData(modelBuilder);
    }

    private static void SeedBudgetData(ModelBuilder modelBuilder)
    {
        var defaultTemplateJson = @"[
          {
            ""category"": ""Product Design"",
            ""items"": [
              { ""name"": ""Benchmarking sample"" },
              { ""name"": ""FEA Analysis"" },
              { ""name"": ""CFD Analysis"" },
              { ""name"": ""Design consultancy"" },
              { ""name"": ""Others"" }
            ]
          },
          {
            ""category"": ""Concept devpt."",
            ""items"": [
              { ""name"": ""Special raw materials"" },
              { ""name"": ""Plastic - Hand / Injection mould"" },
              { ""name"": ""Rubber mould - Single cavity"" },
              { ""name"": ""3D printing"" },
              { ""name"": ""RPT"" },
              { ""name"": ""MIM"" },
              { ""name"": ""Jigs & fixtures"" },
              { ""name"": ""Manufacturing machines"" },
              { ""name"": ""Testing equipments"" },
              { ""name"": ""Special cutting tools"" },
              { ""name"": ""Concept testing - Functional & other testing"" },
              { ""name"": ""Concept testing - Life testing"" },
              { ""name"": ""FEA/CFD Analysis (External)"" }
            ],
            ""subCategories"": [
              {
                ""name"": ""Concept manufacturing. Qty:"",
                ""items"": [
                  { ""name"": ""Quantity for concept development"" },
                  { ""name"": ""Product M+L for concept development"" }
                ]
              }
            ]
          },
          {
            ""category"": ""Prototype devpt."",
            ""items"": [
              { ""name"": ""Plastic - Inj. moulds"" },
              { ""name"": ""Aluminium - Die casting"" },
              { ""name"": ""Investment casting"" },
              { ""name"": ""Stamping tools"" },
              { ""name"": ""Rubber moulds"" },
              { ""name"": ""Jigs & fixtures"" },
              { ""name"": ""Manufacturing machines"" },
              { ""name"": ""Testing equipments"" },
              { ""name"": ""Special cutting tools"" },
              { ""name"": ""Prototype testing - Functional & other testing"" },
              { ""name"": ""Prototype testing - Life testing"" },
              { ""name"": ""FEA/CFD Analysis (External)"" }
            ],
            ""subCategories"": [
              {
                ""name"": ""Prototype manufacturing"",
                ""items"": [
                  { ""name"": ""Quantity for prototype development"" },
                  { ""name"": ""Product M+L for prototype development"" }
                ]
              }
            ]
          },
          {
            ""category"": ""Product testing & Measuring Equipment"",
            ""items"": [
              { ""name"": ""Testing instruments"" },
              { ""name"": ""Testing fixtures"" },
              { ""name"": ""Certification"" }
            ]
          },
          {
            ""category"": ""Field validation"",
            ""items"": [
              { ""name"": ""Product development"" }
            ]
          },
          {
            ""category"": ""Indirect cost"",
            ""items"": [
              { ""name"": ""Contingencies Expense"" }
            ]
          }
        ]";

            defaultTemplateJson = System.Text.RegularExpressions.Regex.Replace(defaultTemplateJson, @"\r?\n", "\r\n");

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
