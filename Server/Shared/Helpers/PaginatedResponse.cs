namespace Server.Shared.Helpers;

public sealed record PaginatedResponse<T>(
    IReadOnlyList<T> Data,
    int TotalCount,
    int Page,
    int PageSize);
