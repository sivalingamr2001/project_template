namespace JanaticsApi.Common.Models;

// ── API Result Wrapper ────────────────────────────────────────────────────────

public class ApiResult<T>
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public T? Data { get; init; }
    public IEnumerable<string>? Errors { get; init; }

    public static ApiResult<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResult<T> Fail(string message, IEnumerable<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

// ── Pagination ────────────────────────────────────────────────────────────────

public class PagedResult<T>
{
    public int TotalCount { get; init; }
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
    public IEnumerable<T> Data { get; init; } = Enumerable.Empty<T>();
}

public class PagedQuery
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public int Skip => (PageNumber - 1) * PageSize;

    public void Normalize()
    {
        if (PageNumber < 1) PageNumber = 1;
        if (PageSize < 1) PageSize = 10;
        if (PageSize > 100) PageSize = 100; // cap at 100
    }
}
