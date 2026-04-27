namespace Server.Features.Auth.Login;

public sealed record LoginRequest(string Identifier, string Password);

public sealed record LoginResponse(SessionDto Session);

public sealed record SessionDto(LoggedInUserDto User);

public sealed record HODDetailsDto(
    int EmployeeId,
    string Name,
    string Email,
    string Phone);

public sealed record SessionDepartmentDto(
    int DepartmentId,
    string DepartmentName,
    HODDetailsDto? Hod);

public sealed record LoggedInUserDto(
    int UserId,
    int EmployeeId,
    string UserName,
    string FirstName,
    string LastName,
    string Name,
    string Email,
    string Phone,
    string Mobile,
    string Location,
    bool IsActive,
    DateTime CreatedOn,
    DateTime UpdatedOn,
    int DepartmentId,
    string DepartmentName,
    string Role,
    HODDetailsDto? DepartmentHod,
    SessionDepartmentDto? Department);
