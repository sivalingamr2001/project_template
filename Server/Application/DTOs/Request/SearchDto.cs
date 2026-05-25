namespace Application.DTOs.Request;

public record ProjectHeaderDto(
    string ProductNo,
    string Revision,
    string ProjectNumber,
    string ProjectName
);

public record PartDetailDto(
    string PartNumber,
    string PartName,
    string Rev
);
