using Server.Shared.Helpers;

namespace Server.Features.Employees;

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

public sealed class GetUsersQuery : PagedRequest;

public sealed record LegacyDepartmentHodDto(
    int EmployeeId,
    string Name,
    string Email,
    string Phone);

public sealed record LegacyUserProfileDto(
    int UserId,
    int EmployeeId,
    string UserName,
    string Name,
    string Email,
    string Phone,
    int DepartmentId,
    string DepartmentName,
    string Role,
    LegacyDepartmentHodDto? DepartmentHod);

public sealed record LegacyUserListItemDto(
    int UserId,
    int EmployeeId,
    string Name,
    string Email,
    string DepartmentName,
    string Role);

public sealed record LegacyUpdateUserRequest(
    int? EmployeeId,
    string? UserName,
    string? FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    string? Location,
    int? DepartmentId,
    string? DepartmentName,
    string? Role);

public sealed record LegacyCreateUserRequest(
    int? EmployeeId,
    string UserName,
    string? FirstName,
    string? LastName,
    string? Email,
    string? Phone,
    int? DepartmentId,
    string? DepartmentName,
    string? Role,
    string Password);

public sealed record UpdatePasswordRequest(string Password);
