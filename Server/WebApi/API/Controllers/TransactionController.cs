using DataEngine.Abstractions;
using DataEngine.Model;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController(IDynamicTransactionProcessor dynamicTransaction, IDynamicReadEngine dynamicReadEngine) : ControllerBase
{
    private readonly IDynamicTransactionProcessor _dynamicTransaction = dynamicTransaction;
    private readonly IDynamicReadEngine _dynamicReadEngine = dynamicReadEngine;

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
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("ExecuteQuery")]
    public async Task<ActionResult<FetchResult>> ExecuteQuery(
    [FromBody] FetchConfig config, // Change to FromBody
    [FromHeader(Name = "X-Connection-String")] string connectionString)
    {
        if (config == null)
        {
            return BadRequest(new FetchResult
            {
                Success = false,
                Message = "The query configuration payload cannot be empty."
            });
        }
        var result = await _dynamicReadEngine.ExecuteQueryAsync(config, connectionString);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
