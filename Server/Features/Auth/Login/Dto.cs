namespace Server.Features.Auth.Login;

public sealed record LoginRequest(string Identifier, string Password);

public sealed record LoginResponse(SessionDto Session);

public sealed record SessionDto(LoggedInUserDto User);

public sealed record HODDetailsDto(
    int UserId,
    string Name,
    string Email,
    string Phone);

public sealed record SessionDepartmentDto(
    int DepartmentId,
    string DepartmentName,
    HODDetailsDto? Hod);

public sealed record LoggedInUserDto
{
    public int UserId { get; init; }
    public string EmployeeId { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public long Mobile { get; init; }
    public int DepartmentId { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string Location { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public DateTime CreatedOn { get; init; }
    public DateTime UpdatedOn { get; init; }
    public string DepartmentName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public HODDetailsDto? DepartmentHod { get; init; }
    public SessionDepartmentDto? Department { get; init; }
}
