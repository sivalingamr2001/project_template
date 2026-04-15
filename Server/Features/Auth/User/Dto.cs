using Server.Shared.Helpers;

namespace Server.Features.Auth.User;

public sealed class GetAllUsersQuery : PagedRequest;

public record UserListResponse(IEnumerable<UserDto> Users);

public record UserDto(
    int EmployeeId,
    string? FirstName,
    string? LastName,
    string UserName,
    string? Mobile,
    string? Location,
    string? Email,
    int? DeptId,
    string? DepartmentName,
    string? Role,
    int? HodID,
    string? HodName,
    string? HodEmail);
