using System.IO;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Infrastructure.Db;

namespace Server.Features.Admin.FolderMapping;

public sealed class FolderMappingService(
    AppDbContext dbContext,
    IConfiguration configuration)
{
    private readonly string _csvFilePath = Path.Combine(AppContext.BaseDirectory, "Folders.csv");

    public async Task<IReadOnlyList<FolderMappingDto>> GetFolderMappingsAsync(CancellationToken cancellationToken)
    {
        var existingMappings = await dbContext.Set<FolderMappingEntity>()
            .AsNoTracking()
            .ToDictionaryAsync(x => x.FolderName, x => x, cancellationToken);

        var folders = ReadFoldersFromCsv();

        var response = folders.Select(folder =>
        {
            if (existingMappings.TryGetValue(folder, out var mapped))
            {
                return new FolderMappingDto(folder, mapped.HodId, mapped.HodName, mapped.HodEmail);
            }

            return new FolderMappingDto(folder, null, null, null);
        }).ToList();

        return response;
    }

    public async Task<FolderMappingDto> SaveFolderMappingAsync(FolderMappingUpdateRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FolderName))
        {
            throw new InvalidOperationException("Folder name is required.");
        }

        var folderName = request.FolderName.Trim();
        var mapping = await dbContext.Set<FolderMappingEntity>()
            .FirstOrDefaultAsync(x => x.FolderName == folderName, cancellationToken);

        if (mapping is null)
        {
            mapping = new FolderMappingEntity
            {
                FolderName = folderName,
                HodId = string.IsNullOrWhiteSpace(request.HodId) ? null : request.HodId.Trim(),
                HodName = string.IsNullOrWhiteSpace(request.HodName) ? null : request.HodName.Trim(),
                HodEmail = string.IsNullOrWhiteSpace(request.HodEmail) ? null : request.HodEmail.Trim(),
                CreatedOn = DateTime.UtcNow,
                UpdatedOn = DateTime.UtcNow,
            };
            dbContext.Set<FolderMappingEntity>().Add(mapping);
        }
        else
        {
            mapping.HodId = string.IsNullOrWhiteSpace(request.HodId) ? null : request.HodId.Trim();
            mapping.HodName = string.IsNullOrWhiteSpace(request.HodName) ? null : request.HodName.Trim();
            mapping.HodEmail = string.IsNullOrWhiteSpace(request.HodEmail) ? null : request.HodEmail.Trim();
            mapping.UpdatedOn = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return new FolderMappingDto(
            mapping.FolderName,
            mapping.HodId,
            mapping.HodName,
            mapping.HodEmail);
    }

    private IReadOnlyList<string> ReadFoldersFromCsv()
    {
        if (!File.Exists(_csvFilePath))
        {
            return Array.Empty<string>();
        }

        var lines = File.ReadAllLines(_csvFilePath)
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Skip(1)
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Select(line => line.Trim('"'))
            .ToList();

        return lines;
    }
}
