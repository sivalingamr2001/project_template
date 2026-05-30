using DataEngine.Model;

namespace DataEngine.Abstractions;

public interface IDynamicReadEngine
{
    Task<FetchResult> ExecuteQueryAsync(FetchConfig config, string connectionString, CancellationToken cancellationToken = default);
}
