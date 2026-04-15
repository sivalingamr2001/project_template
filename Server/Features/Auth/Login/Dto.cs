namespace Server.Features.Auth.Login;

public sealed record LoginRequest(string Identifier, string Password);

public sealed record LoginResponse(SessionDto Session);

public sealed record SessionDto(LoggedInUserDto User);

public sealed record LoggedInUserDto(
    int EmployeeId,
    string Name,
    string Email,
    int? DeptId,
    string DepartmentName,
    string Role,
    int HodEmployeeId, 
    string HodName, 
    string HodEmail);
