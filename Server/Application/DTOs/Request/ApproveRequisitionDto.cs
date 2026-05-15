namespace Application.DTOs.Request;

public record ApproveRequisitionDto(
    string ApprovedBy,
    string ApprovalDate,
    string Comments
);
