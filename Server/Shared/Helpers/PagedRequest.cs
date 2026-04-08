namespace Server.Shared.Helpers;

public class PagedRequest
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public int Page { get; init; } = DefaultPage;
    public int PageSize { get; init; } = DefaultPageSize;

    public int NormalizedPage => Page < 1 ? DefaultPage : Page;

    public int NormalizedPageSize => PageSize switch
    {
        < 1 => DefaultPageSize,
        > MaxPageSize => MaxPageSize,
        _ => PageSize
    };

    public int Skip => (NormalizedPage - 1) * NormalizedPageSize;
}
