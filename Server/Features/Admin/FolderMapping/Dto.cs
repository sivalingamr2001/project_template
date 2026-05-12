namespace Server.Features.Admin.FolderMapping;

public sealed record FolderMappingDto(
    int Id,
    string FolderName,
    string? PrimaryHodId,
    string? PrimaryHodName,
    string? PrimaryHodEmail,
    string? SecondaryHodId,
    string? SecondaryHodName,
    string? SecondaryHodEmail,
    bool IsActive,
    DateTime CreatedOn,
    string CreatedBy,
    DateTime? ModifiedOn,
    string? ModifiedBy);

public sealed record FolderMappingCreateOrUpdateRequest(
    int? Id,
    string FolderName,
    string? PrimaryHodId,
    string? PrimaryHodName,
    string? PrimaryHodEmail,
    string? SecondaryHodId,
    string? SecondaryHodName,
    string? SecondaryHodEmail,
    bool IsActive,
    string? CreatedBy,
    string? ModifiedBy,
    DateTime CreatedOn,
    DateTime ModifiedOn);
