using DataEngine.Model;

namespace DataEngine.Abstractions;

/// <summary>
/// Retained for backwards compatibility.
/// New code should use ITransaction.ExecuteQuery instead.
/// </summary>
public interface IDynamicReadEngine
{
    Task<FetchResult> ExecuteQueryAsync(
        FetchConfig config,
        string connectionString,
        CancellationToken cancellationToken = default);
}
