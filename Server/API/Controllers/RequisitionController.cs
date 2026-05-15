using Microsoft.AspNetCore.Mvc;
using Application.Contracts;
using Application.DTOs.Request;

namespace API.Controllers
{
    [Route("api/requisitions")]
    [ApiController]
    public class RequisitionController : ControllerBase
    {
        private readonly IRequisitionService _requisitionService;

        public RequisitionController(IRequisitionService requisitionService)
        {
            _requisitionService = requisitionService;
        }

        /// <summary>
        /// Get all requisitions with pagination and filtering
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllRequisitions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string status = null,
            [FromQuery] string search = null,
            [FromQuery] string sortBy = null,
            [FromQuery] string sortOrder = null)
        {
            try
            {
                var result = await _requisitionService.GetPaginatedAsync(page, pageSize, status, search, sortBy, sortOrder);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = new { code = "ERROR", message = ex.Message } });
            }
        }

        /// <summary>
        /// Get single requisition by RecNo
        /// </summary>
        [HttpGet("{recNo}")]
        public async Task<IActionResult> GetRequisition(string recNo)
        {
            try
            {
                var result = await _requisitionService.GetByRecNoAsync(recNo);
                return Ok(new { data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = new { code = "NOT_FOUND", message = ex.Message } });
            }
        }

        /// <summary>
        /// Create new requisition
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateRequisition([FromBody] CreateRequisitionDto dto)
        {
            try
            {
                var result = await _requisitionService.CreateAsync(dto);
                return StatusCode(201, new { success = true, message = "Requisition created successfully", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = new { code = "VALIDATION_ERROR", message = ex.Message } });
            }
        }

        /// <summary>
        /// Update requisition
        /// </summary>
        [HttpPut("{recNo}")]
        public async Task<IActionResult> UpdateRequisition(string recNo, [FromBody] UpdateRequisitionDto dto)
        {
            try
            {
                var result = await _requisitionService.UpdateAsync(recNo, dto);
                return Ok(new { success = true, message = "Requisition updated successfully", data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = new { code = "NOT_FOUND", message = ex.Message } });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, error = new { code = "CONFLICT", message = ex.Message } });
            }
        }

        /// <summary>
        /// Submit requisition for approval
        /// </summary>
        [HttpPost("{recNo}/submit")]
        public async Task<IActionResult> SubmitRequisition(string recNo, [FromBody] SubmitRequisitionDto dto)
        {
            try
            {
                var result = await _requisitionService.SubmitAsync(recNo, dto);
                return Ok(new { success = true, message = "Requisition submitted for approval", data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = new { code = "NOT_FOUND", message = ex.Message } });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_OPERATION", message = ex.Message } });
            }
        }

        /// <summary>
        /// Approve requisition
        /// </summary>
        [HttpPost("{recNo}/approve")]
        public async Task<IActionResult> ApproveRequisition(string recNo, [FromBody] ApproveRequisitionDto dto)
        {
            try
            {
                var result = await _requisitionService.ApproveAsync(recNo, dto);
                return Ok(new { success = true, message = "Requisition approved successfully", data = new { recNo = result.RecNo, status = result.Status, approvedBy = result.ApprovedBy, approvedDate = result.ApprovedDate } });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = new { code = "NOT_FOUND", message = ex.Message } });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_OPERATION", message = ex.Message } });
            }
        }

        /// <summary>
        /// Delete requisition
        /// </summary>
        [HttpDelete("{recNo}")]
        public async Task<IActionResult> DeleteRequisition(string recNo)
        {
            try
            {
                await _requisitionService.DeleteAsync(recNo);
                return Ok(new { success = true, message = "Requisition deleted successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = new { code = "NOT_FOUND", message = ex.Message } });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_OPERATION", message = ex.Message } });
            }
        }

        /// <summary>
        /// Export requisition as PDF or Excel
        /// </summary>
        [HttpGet("{recNo}/export")]
        public async Task<IActionResult> ExportRequisition(string recNo, [FromQuery] string format = "pdf")
        {
            try
            {
                var fileContent = await _requisitionService.ExportAsync(recNo, format);

                if (format.Equals("excel", StringComparison.OrdinalIgnoreCase))
                {
                    return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{recNo}.xlsx");
                }
                else
                {
                    return File(fileContent, "application/pdf", $"{recNo}.pdf");
                }
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, error = new { code = "NOT_FOUND", message = ex.Message } });
            }
        }
    }
}
