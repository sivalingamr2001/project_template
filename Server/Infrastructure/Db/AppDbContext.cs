using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

namespace Server.Infrastructure.Db;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetCategory> BudgetCategories => Set<BudgetCategory>();
    public DbSet<BudgetItem> BudgetItems => Set<BudgetItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Employee Configuration
        modelBuilder.Entity<EmployeeEntity>(entity =>
        {
            entity.ToTable("jan_employees");
            entity.HasKey(e => e.EmployeeId);
        });

        // 2. Budget Header (The Project)
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.ToTable("jan_budgets");
            entity.HasKey(e => e.BudgetId);

            // Unique constraint on ProjectCode
            entity.HasIndex(e => e.ProjectCode).IsUnique();
        });

        // 3. Budget Categories
        modelBuilder.Entity<BudgetCategory>(entity =>
        {
            entity.ToTable("jan_budget_categories");
            entity.HasKey(e => e.CategoryId);

            // Relationship: Budget -> Categories (1:N)
            entity.HasOne(d => d.Budget)
                  .WithMany(p => p.Categories)
                  .HasForeignKey(d => d.BudgetId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 4. Budget Items (Line Items)
        modelBuilder.Entity<BudgetItem>(entity =>
        {
            entity.ToTable("jan_budget_items");
            entity.HasKey(e => e.ItemId);

            // Precision for financial data
            entity.Property(e => e.Planned).HasPrecision(18, 2);
            entity.Property(e => e.Actual).HasPrecision(18, 2);

            // Relationship: Category -> Items (1:N)
            entity.HasOne(d => d.Category)
                  .WithMany(p => p.Items)
                  .HasForeignKey(d => d.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        SeedBudgetData(modelBuilder);
    }

    private static void SeedBudgetData(ModelBuilder modelBuilder)
    {
        // Seed Categories
        modelBuilder.Entity<BudgetCategory>().HasData(
            new BudgetCategory { CategoryId = 1, CategoryName = "Product Design" },
            new BudgetCategory { CategoryId = 2, CategoryName = "Concept Development" },
            new BudgetCategory { CategoryId = 3, CategoryName = "Prototype Development" },
            new BudgetCategory { CategoryId = 4, CategoryName = "Product Testing" },
            new BudgetCategory { CategoryId = 5, CategoryName = "Capital Equipments" },
            new BudgetCategory { CategoryId = 6, CategoryName = "Field Validation" }
        );

        // Seed Cost Items
        modelBuilder.Entity<BudgetItem>().HasData(
            // 1: Product design
            new BudgetItem { ItemId = 1, CategoryId = 1, ItemName = "Benchmarking sample" },
            new BudgetItem { ItemId = 2, CategoryId = 1, ItemName = "FEA Analysis" },
            new BudgetItem { ItemId = 3, CategoryId = 1, ItemName = "CFD Analysis" },
            new BudgetItem { ItemId = 4, CategoryId = 1, ItemName = "Design consultancy" },
            new BudgetItem { ItemId = 5, CategoryId = 1, ItemName = "Others" },

            // 2: Concept development
            new BudgetItem { ItemId = 6, CategoryId = 2, ItemName = "Comp.devpt-Concept" },
            new BudgetItem { ItemId = 7, CategoryId = 2, ItemName = "Machining components" },
            new BudgetItem { ItemId = 8, CategoryId = 2, ItemName = "Plastic - Hand moulds" },
            new BudgetItem { ItemId = 9, CategoryId = 2, ItemName = "Rubber moulds" },
            new BudgetItem { ItemId = 10, CategoryId = 2, ItemName = "3D printing" },
            new BudgetItem { ItemId = 11, CategoryId = 2, ItemName = "RPT" },
            new BudgetItem { ItemId = 12, CategoryId = 2, ItemName = "MIM" },
            new BudgetItem { ItemId = 13, CategoryId = 2, ItemName = "Jigs & fixtures" },
            new BudgetItem { ItemId = 14, CategoryId = 2, ItemName = "Concept testing" },

            // 3: Prototype development
            new BudgetItem { ItemId = 15, CategoryId = 3, ItemName = "Machining components" },
            new BudgetItem { ItemId = 16, CategoryId = 3, ItemName = "Plastic - Injection moulds" },
            new BudgetItem { ItemId = 17, CategoryId = 3, ItemName = "Aluminium - Die casting" },
            new BudgetItem { ItemId = 18, CategoryId = 3, ItemName = "Investment casting" },
            new BudgetItem { ItemId = 19, CategoryId = 3, ItemName = "Stamping tools" },
            new BudgetItem { ItemId = 20, CategoryId = 3, ItemName = "Rubber moulds" },
            new BudgetItem { ItemId = 21, CategoryId = 3, ItemName = "Jigs & fixtures" },
            new BudgetItem { ItemId = 22, CategoryId = 3, ItemName = "Comp. mfg." },
            new BudgetItem { ItemId = 23, CategoryId = 3, ItemName = "Testing" },

            // 4: Product testing
            new BudgetItem { ItemId = 24, CategoryId = 4, ItemName = "Testing instruments" },
            new BudgetItem { ItemId = 25, CategoryId = 4, ItemName = "Testing fixtures" },
            new BudgetItem { ItemId = 26, CategoryId = 4, ItemName = "Certification" },
            new BudgetItem { ItemId = 27, CategoryId = 4, ItemName = "Others" },

            // 5: Capital equipments
            new BudgetItem { ItemId = 28, CategoryId = 5, ItemName = "Testing equipments" },
            new BudgetItem { ItemId = 29, CategoryId = 5, ItemName = "Special machines" },
            new BudgetItem { ItemId = 30, CategoryId = 5, ItemName = "Others" },

            // 6: Field validation
            new BudgetItem { ItemId = 31, CategoryId = 6, ItemName = "Product development" }
        );
    }
}
