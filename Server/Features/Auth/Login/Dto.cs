using Server.Features.Common;

namespace Server.Features.Auth.Login;

public sealed record LoginRequest(string Identifier, string Password);

public sealed record LoginResponse(SessionDto Session);

public sealed record SessionDto(LoggedInUserDto User);

public sealed record LoggedInUserDto(
    int UserId,
    int EmployeeId,
    string UserName,
    string Name,
    string Email,
    string Phone,
    int DepartmentId,
    string DepartmentName,
    string Role,
    DepartmentDto? DepartmentHod);
