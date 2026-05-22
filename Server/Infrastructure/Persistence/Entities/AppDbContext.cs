using Domain.DomainEnums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Entities
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // Requisition relationships
            modelBuilder.Entity<Part>()
                .HasOne(x => x.Requisition)
                .WithMany(x => x.Parts)
                .HasForeignKey(x => x.RequisitionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    FullName = "System Administrator",
                    Email = "admin@company.com",
                    Password = "password",
                    Role = UserRoles.User,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = "System"
                },
                new User
                {
                    Id = 2,
                    FullName = "John HOD",
                    Email = "hod@company.com",
                    Password = "password",
                    Role = UserRoles.Hod,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    CreatedBy = "System"
                }
            );
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Requisition> Requisitions { get; set; }
        public DbSet<Part> Parts { get; set; }
    }
}
