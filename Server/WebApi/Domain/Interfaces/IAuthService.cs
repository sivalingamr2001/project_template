using WebApi.Domain.Dto;

namespace WebApi.Domain.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> AuthenticateUserAsync(LoginRequest request, CancellationToken cancellationToken = default);
}

public sealed class AuthResponse
{
    public int CmplUserId { get; set; }
    public string CmplUserName { get; set; } = string.Empty;
    public string? EmpId { get; set; }
    public string? MailId { get; set; }
    public string? MobNo { get; set; }
    public int? DeptId { get; set; }
    public string Role { get; set; } = "User";
    public string Location { get; set; } = "Unknown";
}
