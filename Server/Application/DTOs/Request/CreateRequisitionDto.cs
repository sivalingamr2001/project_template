using System;
using System.Collections.Generic;

namespace Application.DTOs.Request;

public record SignatureDto(string Name, string Date);

public record CreateRequisitionDto(
    DateTime Date,
    string PageNo,
    string FromTeam,
    string ToTeam,
    string ProductNo,
    string ProductRev,
    string ProjectNo,
    string ProductName,
    string Purpose,
    string MonthlyQty,
    List<PartDto> Parts,
    SignatureDto Prepared,
    SignatureDto Checked,
    bool MoqWarningAccepted
);
