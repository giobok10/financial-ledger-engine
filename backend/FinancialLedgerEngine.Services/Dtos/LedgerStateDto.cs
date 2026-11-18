namespace FinancialLedgerEngine.Services.Dtos;

public class LedgerStateDto
{
    public int TotalCount { get; set; }
    public int? HeadValue { get; set; }
    public List<int> SampleValues { get; set; } = new();
}
