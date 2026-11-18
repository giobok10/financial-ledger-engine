using FinancialLedgerEngine.Services;
using FinancialLedgerEngine.Services.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace FinancialLedgerEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LedgerController : ControllerBase
{
    private readonly ITransactionLedgerService _ledgerService;

    public LedgerController(ITransactionLedgerService ledgerService)
    {
        _ledgerService = ledgerService;
    }

    [HttpPost("populate")]
    public IActionResult Populate([FromQuery] int count = 100000)
    {
        if (count <= 0 || count > 1_000_000)
        {
            return BadRequest("El número de nodos debe estar entre 1 y 1,000,000.");
        }

        _ledgerService.PopulateLedger(count);
        return Ok(new { message = $"Ledger poblado exitosamente con {count} nodos contables." });
    }

    [HttpGet("state")]
    public ActionResult<LedgerStateDto> GetState()
    {
        return Ok(_ledgerService.GetState());
    }

    [HttpPost("reverse")]
    public ActionResult<ReversalResultDto> Reverse([FromQuery] bool useIterative = true)
    {
        var result = _ledgerService.ReverseLedger(useIterative);
        return Ok(result);
    }

    [HttpPost("reset")]
    public IActionResult Reset()
    {
        _ledgerService.Reset();
        return Ok(new { message = "Ledger reiniciado y vaciado en memoria RAM." });
    }
}
