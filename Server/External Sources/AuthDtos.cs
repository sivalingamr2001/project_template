namespace JanaticsApi.Features.Auth;

public record RegisterRequest(
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

public record LoginRequest(
    string Username,
    string Password
);

public record AuthResponse(
    int EmployeeId,
    string Username,
    string FullName,
    string Role,
    string Email
);
