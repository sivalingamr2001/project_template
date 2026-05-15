using System;

namespace Application.DTOs.Response;

public record PartResponseDto(
    int SNo,
    string PartNo,
    string Rev,
    string PartName,
    int Qty,
    DateTime RequiredDate,
    DateTime CommittedDate,
    DateTime? ActualCompletionDate
);
