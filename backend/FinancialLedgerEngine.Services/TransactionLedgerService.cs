using System.Diagnostics;
using FinancialLedgerEngine.Domain;
using FinancialLedgerEngine.Services.Dtos;

namespace FinancialLedgerEngine.Services;

public class TransactionLedgerService : ITransactionLedgerService
{
    private SinglyLinkedListLedger _ledger = new();

    public void PopulateLedger(int count)
    {
        _ledger = new SinglyLinkedListLedger();
        for (int i = 1; i <= count; i++)
        {
            _ledger.Push(i);
        }
    }

    public LedgerStateDto GetState()
    {
        var sample = new List<int>();
        var current = _ledger.Head;
        int maxSample = 5;

        while (current != null && sample.Count < maxSample)
        {
            sample.Add(current.Val);
            current = current.Next;
        }

        return new LedgerStateDto
        {
            TotalCount = _ledger.Count,
            HeadValue = _ledger.Head?.Val,
            SampleValues = sample
        };
    }

    public ReversalResultDto ReverseLedger(bool useIterative)
    {
        int nodesCount = _ledger.Count;
        string algorithm = useIterative ? "Iterativo (3 Punteros - O(1) Memoria)" : "Recursivo (Legacy - O(N) Pila)";

        long initialMemory = GC.GetAllocatedBytesForCurrentThread();
        var stopwatch = Stopwatch.StartNew();

        try
        {
            if (useIterative)
            {
                _ledger.ReverseIterative();
            }
            else
            {
                _ledger.ReverseRecursive();
            }

            stopwatch.Stop();
            long finalMemory = GC.GetAllocatedBytesForCurrentThread();

            return new ReversalResultDto
            {
                AlgorithmUsed = algorithm,
                ExecutionTimeTicks = stopwatch.ElapsedTicks,
                ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds,
                MemoryAllocatedBytes = Math.Max(0, finalMemory - initialMemory),
                NodesProcessed = nodesCount,
                Success = true
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            return new ReversalResultDto
            {
                AlgorithmUsed = algorithm,
                ExecutionTimeTicks = stopwatch.ElapsedTicks,
                ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds,
                MemoryAllocatedBytes = 0,
                NodesProcessed = nodesCount,
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public void Reset()
    {
        _ledger = new SinglyLinkedListLedger();
    }
}
