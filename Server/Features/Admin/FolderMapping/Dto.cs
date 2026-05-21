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
    int CreatedBy,
    DateTime? ModifiedOn,
    int? ModifiedBy);

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
    int? CreatedBy,
    int? ModifiedBy,
    DateTime CreatedOn,
    DateTime ModifiedOn);
