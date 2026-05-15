namespace Application.DTOs.Response;

public record ApiResponseDto<T>(
    bool Success,
    string Message,
    T Data
);

public record ErrorResponseDto(
    string Code,
    string Message
);
