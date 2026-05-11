namespace Server.Features.Admin.FolderMapping;

public sealed record FolderMappingDto(
    string FolderName,
    string? HodId,
    string? HodName,
    string? HodEmail);

public sealed record FolderMappingUpdateRequest(
    string FolderName,
    string? HodId,
    string? HodName,
    string? HodEmail);
