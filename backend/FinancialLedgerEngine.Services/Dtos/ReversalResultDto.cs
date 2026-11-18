namespace FinancialLedgerEngine.Services.Dtos;

public class ReversalResultDto
{
    public string AlgorithmUsed { get; set; } = string.Empty;
    public long ExecutionTimeTicks { get; set; }
    public double ExecutionTimeMs { get; set; }
    public long MemoryAllocatedBytes { get; set; }
    public int NodesProcessed { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
