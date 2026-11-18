using FinancialLedgerEngine.Services.Dtos;

namespace FinancialLedgerEngine.Services;

public interface ITransactionLedgerService
{
    void PopulateLedger(int count);
    LedgerStateDto GetState();
    ReversalResultDto ReverseLedger(bool useIterative);
    void Reset();
}
