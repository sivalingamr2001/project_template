using System.Collections.Generic;

namespace Application.DTOs.Response;

public record PaginatedResponseDto<T>(
    List<T> Data,
    PaginationDto Pagination
);

public record PaginationDto(
    int Total,
    int Page,
    int PageSize,
    int TotalPages
);
