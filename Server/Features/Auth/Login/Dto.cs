namespace Server.Features.Auth.Login;

public sealed record LoginRequest(int EmployeeId, string Password);

public sealed record LoginResponse(SessionDto Session);

public sealed record SessionDto(LoggedInUserDto User);

public sealed record LoggedInUserDto(
    int EmployeeId,
    string Name,
    string Email,
    int DepartmentId,
    string DepartmentName,
    string Role);
