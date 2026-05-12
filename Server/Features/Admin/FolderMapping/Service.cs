using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Admin.FolderMapping;

public sealed class FolderMappingService(FolderService folderService, AppDbContext dbContext)
{
    public async Task<IReadOnlyList<FolderMappingDto>> GetFolderMappingsAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Set<FolderMappingEntity>()
            .AsNoTracking()
            .Select(m => new FolderMappingDto(
                m.Id,
                m.FolderName,
                m.PrimaryHodId,
                m.PrimaryHodName,
                m.PrimaryHodEmail,
                m.SecondaryHodId,
                m.SecondaryHodName,
                m.SecondaryHodEmail,
                m.IsActive,
                m.CreatedOn,
                m.CreatedBy,
                m.ModifiedOn,
                m.ModifiedBy))
            .ToListAsync(cancellationToken);
    }

    public async Task<FolderMappingDto> SaveFolderMappingAsync(FolderMappingCreateOrUpdateRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FolderName))
        {
            throw new InvalidOperationException("Folder name is required.");
        }

        var folderName = request.FolderName.Trim();

        // 1. Try to find by ID first
        var mapping = await dbContext.Set<FolderMappingEntity>()
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (mapping is null)
        {
            // 2. If creating new, ensure the name isn't already taken
            var exists = await dbContext.Set<FolderMappingEntity>()
                .AnyAsync(x => x.FolderName == folderName, cancellationToken);

            if (exists) throw new InvalidOperationException($"Folder '{folderName}' already exists.");

            mapping = new FolderMappingEntity
            {
                FolderName = folderName,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = request.ModifiedBy ?? "System" // Use modifier as creator for new records
            };
            dbContext.Set<FolderMappingEntity>().Add(mapping);
        }
        else
        {
            // 3. If updating, check if the name change conflicts with another record
            var nameConflict = await dbContext.Set<FolderMappingEntity>()
                .AnyAsync(x => x.FolderName == folderName && x.Id != request.Id, cancellationToken);

            if (nameConflict) throw new InvalidOperationException($"Cannot rename to '{folderName}'; name already in use.");
        }

        // Map fields (Shared for both Create and Update)
        mapping.FolderName = folderName;
        mapping.PrimaryHodId = request.PrimaryHodId?.Trim();
        mapping.PrimaryHodName = request.PrimaryHodName?.Trim();
        mapping.PrimaryHodEmail = request.PrimaryHodEmail?.Trim();
        mapping.SecondaryHodId = request.SecondaryHodId?.Trim();
        mapping.SecondaryHodName = request.SecondaryHodName?.Trim();
        mapping.SecondaryHodEmail = request.SecondaryHodEmail?.Trim();
        mapping.IsActive = request.IsActive;
        mapping.ModifiedOn = DateTime.UtcNow;
        mapping.ModifiedBy = request.ModifiedBy ?? "System";

        await dbContext.SaveChangesAsync(cancellationToken);

        return new FolderMappingDto(
            mapping.Id,
            mapping.FolderName,
            mapping.PrimaryHodId,
            mapping.PrimaryHodName,
            mapping.PrimaryHodEmail,
            mapping.SecondaryHodId,
            mapping.SecondaryHodName,
            mapping.SecondaryHodEmail,
            mapping.IsActive,
            mapping.CreatedOn,
            mapping.CreatedBy,
            mapping.ModifiedOn,
            mapping.ModifiedBy);
    }

    public async Task DeleteFolderMappingAsync(int id, CancellationToken cancellationToken)
    {
        var mapping = await dbContext.Set<FolderMappingEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"Folder mapping with Id '{id}' does not exist.");

        mapping.IsActive = false;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<FolderResponse>> GetParentFoldersAsync(CancellationToken cancellationToken)
    {
        return await folderService.GetParentFoldersAsync(cancellationToken);
    }

    public Task<List<FolderResponse>> GetFolderHierarchyAsync()
    {
        return Task.FromResult(folderService.GetStrictFolderHierarchy());
    }
}
