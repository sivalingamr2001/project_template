using DataEngine.Model;

namespace DataEngine.Cache;

public interface ISchemaCache
{
    Task<IReadOnlyList<ColumnMetadata>> GetOrAddAsync(string databaseName, string tableName,
        Func<Task<IReadOnlyList<ColumnMetadata>>> factory, CancellationToken cancellationToken = default);

    Task InvalidateAsync(string? databaseName = null, string? tableName = null);

    bool TryGet(string databaseName, string tableName, out IReadOnlyList<ColumnMetadata>? schema);
}
