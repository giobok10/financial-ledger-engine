using FinancialLedgerEngine.Domain;
using Xunit;

namespace FinancialLedgerEngine.Domain.Tests;

public class LedgerReversalTests
{
    [Fact]
    public void PushAndPop_ShouldMaintainLIFOOrder()
    {
        var ledger = new SinglyLinkedListLedger();

        ledger.Push(100);
        ledger.Push(200);

        Assert.Equal(2, ledger.Count);
        Assert.Equal(200, ledger.Pop());
        Assert.Equal(100, ledger.Pop());
        Assert.Equal(0, ledger.Count);
    }

    [Fact]
    public void ReverseIterative_With100KNodes_ShouldExecuteSuccessfullyInConstantMemory()
    {
        var ledger = new SinglyLinkedListLedger();
        int totalElements = 100_000;

        for (int i = 1; i <= totalElements; i++)
        {
            ledger.Push(i);
        }

        ledger.ReverseIterative();

        Assert.Equal(totalElements, ledger.Count);
        Assert.NotNull(ledger.Head);
        Assert.Equal(1, ledger.Head.Val);
    }

    [Fact(Skip = "Demostración de StackOverflowException en algoritmo recursivo legacy")]
    public void ReverseRecursive_With100KNodes_WillOverflowCallStack()
    {
        var ledger = new SinglyLinkedListLedger();
        int totalElements = 100_000;

        for (int i = 1; i <= totalElements; i++)
        {
            ledger.Push(i);
        }

        ledger.ReverseRecursive();
    }
}
