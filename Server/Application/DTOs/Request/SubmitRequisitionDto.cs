namespace Application.DTOs.Request;

public record SubmitRequisitionDto(
    string CheckedBy,
    string CheckDate
);
