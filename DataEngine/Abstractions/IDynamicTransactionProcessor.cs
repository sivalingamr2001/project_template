using DataEngine.Model;

namespace DataEngine.Abstractions;

public interface IDynamicTransactionProcessor
{
    Task<TransactionResult> ProcessTransactionAsync(TransactionRequest request, CancellationToken cancellationToken = default);
}
