namespace FileAccessPortal.Api.Common.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "FileAccessPortal";

    public string Audience { get; set; } = "FileAccessPortal.Client";

    public string SigningKey { get; set; } = "change-this-dev-key-to-a-long-random-secret";

    public int ExpirationMinutes { get; set; } = 480;
}
