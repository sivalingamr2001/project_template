using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Application.Contracts;
using Application.DTOs.Request;
using Application.DTOs.Response;

namespace API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class UserController(IUserService userService) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                var response = await userService.LoginAsync(request);
                return Ok(new { user = response.User, accessToken = response.AccessToken, refreshToken = response.RefreshToken });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ErrorResponseDto("UNAUTHORIZED", ex.Message));
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto request)
        {
            try
            {
                var response = await userService.CreateUserAsync(request);
                if (response)
                {
                    return Created("", new { message = "User created successfully" });
                }
                return BadRequest(new { message = "Failed to create user" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

