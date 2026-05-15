namespace Application.DTOs.Response;

public record LoginResponseDto(
    UserResponseDto User,
    string AccessToken,
    string RefreshToken
);
