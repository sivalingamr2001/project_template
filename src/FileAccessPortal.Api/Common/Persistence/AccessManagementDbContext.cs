using FileAccessPortal.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FileAccessPortal.Api.Common.Persistence;

public class AccessManagementDbContext(DbContextOptions<AccessManagementDbContext> options)
    : DbContext(options)
{
    public DbSet<AccessRequest> AccessRequests => Set<AccessRequest>();
    public DbSet<AccessItem> AccessItems => Set<AccessItem>();
    public DbSet<AccessItemReview> AccessItemReviews => Set<AccessItemReview>();
    public DbSet<RequestAuditTrail> RequestAuditTrail => Set<RequestAuditTrail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AccessManagementDbContext).Assembly);

        modelBuilder.Entity<AccessRequest>(builder =>
        {
            builder.ToTable("AccessRequests");
            builder.HasKey(request => request.RequestId);

            builder.Property(request => request.TicketNumber)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(request => request.AggregateStatus)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(request => request.IsActive)
                .HasDefaultValue(true);

            builder.Property(request => request.CreatedOn)
                .IsRequired();

            builder.HasIndex(request => request.TicketNumber)
                .IsUnique();

            builder.HasIndex(request => new { request.RequesterId, request.IsActive });
        });

        modelBuilder.Entity<AccessItemReview>(builder =>
        {
            builder.ToTable("AccessItemReviews");
            builder.HasKey(review => review.ReviewId);

            builder.Property(review => review.Stage)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(review => review.Note)
                .HasColumnType("nvarchar(max)");

            builder.Property(review => review.IsActive)
                .HasDefaultValue(true);

            builder.Property(review => review.CreatedOn)
                .IsRequired();

            builder.HasIndex(review => new { review.AccessItemId, review.Stage, review.CreatedOn });
        });

        modelBuilder.Entity<RequestAuditTrail>(builder =>
        {
            builder.ToTable("RequestAuditTrail");
            builder.HasKey(audit => audit.AuditId);

            builder.Property(audit => audit.EventType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(audit => audit.Message)
                .IsRequired()
                .HasColumnType("nvarchar(max)");

            builder.Property(audit => audit.IsActive)
                .HasDefaultValue(true);

            builder.Property(audit => audit.CreatedOn)
                .IsRequired();

            builder.HasOne(audit => audit.Request)
                .WithMany(request => request.AuditTrailEntries)
                .HasForeignKey(audit => audit.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(audit => new { audit.RequestId, audit.CreatedOn });
        });
    }
}
