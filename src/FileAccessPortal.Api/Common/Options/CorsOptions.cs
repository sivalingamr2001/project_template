namespace FileAccessPortal.Api.Common.Options;

public sealed class CorsOptions
{
    public const string SectionName = "Cors";
    public const string DefaultPolicyName = "portal-cors";

    public string PolicyName { get; set; } = DefaultPolicyName;
    public string[] AllowedOrigins { get; set; } = ["http://localhost:5173"];
}
