namespace Server.Common.Contracts;

public sealed record SessionResponse(UserResponse User);

public sealed record UserResponse(
    int EmployeeId,
    string Name,
    string Email,
    int DepartmentId,
    string DepartmentName,
    string Role);
