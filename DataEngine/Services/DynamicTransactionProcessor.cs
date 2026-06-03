using DataEngine.Abstractions;
using DataEngine.Model;

namespace DataEngine.Services;

/// <summary>
/// Retained for backwards compatibility.
/// All logic has moved to DataEngineTransaction.TransactionProcess.
/// Existing callers using IDynamicTransactionProcessor continue to work without any change.
/// </summary>
public class DynamicTransactionProcessor(ITransaction engine) : IDynamicTransactionProcessor
{
    private readonly ITransaction _engine = engine;

    public Task<TransactionResult> ProcessTransactionAsync(
        TransactionRequest request,
        CancellationToken cancellationToken = default)
        => _engine.TransactionProcess(request, cancellationToken);
}
