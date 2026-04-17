namespace JanaticsApi.Features.Employees;

// ── Response DTOs ─────────────────────────────────────────────────────────────

public record HodDto(
    int EmployeeId,
    string FirstName,
    string LastName,
    string Username,
    string Email,
    string Mobile,
    string Location,
    string Role,
    bool IsActive
);

public record DepartmentDetailDto(
    int DepartmentId,
    string DepartmentName,
    HodDto? Hod
);

public record EmployeeDto(
    int EmployeeId,
    string FirstName,
    string LastName,
    string Username,
    string Email,
    string Mobile,
    string Location,
    string Role,
    bool IsActive,
    DateTime CreatedOn,
    DateTime UpdatedOn,
    int DepartmentId,
    DepartmentDetailDto? Department
);

// ── Request DTOs ──────────────────────────────────────────────────────────────

public record CreateEmployeeRequest(
    string FirstName,
    string LastName,
    string Username,
    string Password,
    string Email,
    string Mobile,
    string Location,
    string Role,
    int DepartmentId
);

public record UpdateEmployeeRequest(
    string FirstName,
    string LastName,
    string Email,
    string Mobile,
    string Location,
    string Role,
    bool IsActive,
    int DepartmentId
);
