namespace Server.Features.Auth.Login;

public sealed record LoginRequest
{
    public string? Identifier { get; init; }
    public string? Username { get; init; }
    public string Password { get; init; } = string.Empty;

    public string GetIdentifier() =>
        !string.IsNullOrWhiteSpace(Identifier)
            ? Identifier
            : Username ?? string.Empty;
}

public sealed record LoginResponse(SessionDto Session);

public sealed record SessionDto(LoggedInUserDto User);

public sealed record LoggedInUserDto(
    int EmployeeId,
    string Name,
    string Email,
    int DepartmentId,
    string DepartmentName,
    string Role,
    HodDto? DepartmentHod);

public record HodDto(int EmployeeId, string Name, string Email);
