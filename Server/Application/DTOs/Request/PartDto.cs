using System;

namespace Application.DTOs.Request;

public record PartDto(
    string PartNo,
    string Rev,
    string PartName,
    int Qty,
    DateTime RequiredDate,
    DateTime CommittedDate,
    DateTime? ActualCompletionDate
);
