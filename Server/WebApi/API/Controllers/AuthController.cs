using Microsoft.AspNetCore.Mvc;
using WebApi.Domain.Dto;
using WebApi.Domain.Interfaces;

namespace WebApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthResponse))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.AuthenticateUserAsync(request, cancellationToken);

        if (result == null)
        {
            return Unauthorized(new { message = "Access Denied: Invalid identification credentials supplied." });
        }

        return Ok(result);
    }
}
