using System.Security.Claims;
using FileAccessPortal.Api.Common.Errors;

namespace FileAccessPortal.Api.Common.Auth;

public static class ClaimsPrincipalExtensions
{
    public static int GetEmployeeId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var employeeId)
            ? employeeId
            : throw new ForbiddenException("Authenticated employee id claim is missing.");
    }

    public static string GetRoleName(this ClaimsPrincipal principal)
    {
        return principal.FindFirstValue(ClaimTypes.Role)
            ?? throw new ForbiddenException("Authenticated role claim is missing.");
    }
}
