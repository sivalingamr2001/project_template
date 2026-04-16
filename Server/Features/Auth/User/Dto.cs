namespace Server.Features.Auth.User;

using Server.Shared.Helpers;

public sealed class GetUsersQuery : PagedRequest;

public record DepartmentHodDto(int EmployeeId, string Name, string Email);

public record UserProfileDto(
    int UserId,
    int EmployeeId,
    string UserName,
    string Name,
    string Email,
    string Phone,
    int DepartmentId,
    string DepartmentName,
    string Role,
    DepartmentHodDto DepartmentHod);

public record UserListItemDto(
    int UserId,
    int EmployeeId,
    string Name,
    string Email,
    string DepartmentName,
    string Role);

public sealed record UpdateUserRequest(
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

public sealed record CreateUserRequest(
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
