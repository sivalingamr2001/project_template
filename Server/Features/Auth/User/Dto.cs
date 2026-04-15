namespace Server.Features.Auth.User;

public record UserListResponse(IEnumerable<UserDto> Users);

public record UserDto(
    int EmployeeId,
    string Name,
    string Email,
    string Phone,
    int DeptId,
    string DepartmentName,
    string Role,
    HodDto? DepartmentHod);

public record HodDto(int EmployeeId, string Name, string Email);
