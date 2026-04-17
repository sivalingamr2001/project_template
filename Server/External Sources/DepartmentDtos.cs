namespace JanaticsApi.Features.Departments;

// ── Response DTOs ─────────────────────────────────────────────────────────────

public record DepartmentDto(
    int DepartmentId,
    string DepartmentName,
    DateTime CreatedOn,
    DateTime UpdatedOn,
    int? HodId,
    HodSummaryDto? Hod
);

public record HodSummaryDto(
    int EmployeeId,
    string FirstName,
    string LastName,
    string Email,
    string Mobile,
    string Role
);

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateDepartmentRequest(
    string DepartmentName,
    int? HodId
);

public record UpdateDepartmentRequest(
    string DepartmentName,
    int? HodId
);
