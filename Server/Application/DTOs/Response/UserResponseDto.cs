using System;

namespace Application.DTOs.Response
{
    public record UserResponseDto(
        string Id,
        string Email,
        string Name,
        string Role
    );
}
