using Server.Shared.Helpers;

namespace Server.Features.Employees;

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
    int EmployeeId,
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
