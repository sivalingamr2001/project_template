using DataEngine.Model;

namespace DataEngine.Abstractions;

/// <summary>
/// Retained for backwards compatibility.
/// New code should use ITransaction.TransactionProcess instead.
/// </summary>
public interface IDynamicTransactionProcessor
{
    Task<TransactionResult> ProcessTransactionAsync(
        TransactionRequest request,
        CancellationToken cancellationToken = default);
}
