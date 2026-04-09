using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<EmployeeEntity> Employees => Set<EmployeeEntity>();
    public DbSet<CategoryEntity> Categories => Set<CategoryEntity>();
    public DbSet<CostItemEntity> CostItems => Set<CostItemEntity>();
    public DbSet<BudgetDataEntity> BudgetData => Set<BudgetDataEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EmployeeEntity>().ToTable("jan_employees").HasKey(e => e.EmployeeId);

        modelBuilder.Entity<CategoryEntity>(entity => {
            entity.ToTable("jan_categories");
            entity.HasKey(e => e.CategoryId);
        });

        modelBuilder.Entity<CostItemEntity>(entity => {
            entity.ToTable("jan_costitems");
            entity.HasKey(e => e.CostItemId);
            entity.HasOne(d => d.Category).WithMany(p => p.CostItems).HasForeignKey(d => d.CategoryId);
        });

        modelBuilder.Entity<BudgetDataEntity>(entity => {
            entity.ToTable("jan_budgetdata");
            entity.HasKey(e => e.BudgetDataId);
            entity.Property(e => e.PlannedAmount).HasPrecision(18, 2);
            entity.Property(e => e.ActualAmount).HasPrecision(18, 2);
        });

        SeedBudgetData(modelBuilder);
    }

    private static void SeedBudgetData(ModelBuilder modelBuilder)
    {
        // Seed Categories
        modelBuilder.Entity<CategoryEntity>().HasData(
            new CategoryEntity { CategoryId = 1, Name = "Product Design" },
            new CategoryEntity { CategoryId = 2, Name = "Concept devpt." },
            new CategoryEntity { CategoryId = 3, Name = "Prototype devpt." }
        );

        // Seed Cost Items
        modelBuilder.Entity<CostItemEntity>().HasData(
            // Product Design Items
            new CostItemEntity { CostItemId = 1, CategoryId = 1, Name = "Benchmarking sample" },
            new CostItemEntity { CostItemId = 2, CategoryId = 1, Name = "FEA Analysis" },

            // Concept Devpt Items
            new CostItemEntity { CostItemId = 3, CategoryId = 2, Name = "3D printing" },
            new CostItemEntity { CostItemId = 4, CategoryId = 2, Name = "Machining components" }
        );
    }
}
