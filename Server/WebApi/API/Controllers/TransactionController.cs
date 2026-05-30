using DataEngine.Abstractions;
using DataEngine.Model;
using Microsoft.AspNetCore.Mvc;
using WebApi.API.Features._Common;

namespace WebApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController(IDynamicTransactionProcessor dynamicTransaction) : ControllerBase
{
    private readonly IDynamicTransactionProcessor _dynamicTransaction = dynamicTransaction;

    [HttpPost("process")]
    public async Task<ActionResult<TransactionResult>> ProcessTransaction([FromBody] TransactionRequest request)
    {
        if (request == null)
        {
            return BadRequest(new TransactionResult
            {
                Success = false,
                Message = "The transaction request payload cannot be empty."
            });
        }

        var result = await _dynamicTransaction.ProcessTransactionAsync(request);

        if (!result.Success)
        {
            // Returns an HTTP 400 Bad Request if validation or execution fails safely
            return BadRequest(result);
        }

        // Returns an HTTP 200 OK along with generated keys/metadata maps
        return Ok(result);
    }
}
