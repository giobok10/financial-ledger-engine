namespace FinancialLedgerEngine.Domain;

public class TransactionNode
{
    public int Val { get; set; }
    public TransactionNode? Next { get; set; }

    public TransactionNode(int val)
    {
        Val = val;
        Next = null;
    }
}
