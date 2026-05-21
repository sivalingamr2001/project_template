using Application.Contracts;
using Application.DTOs.Request;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/requisitions")]
[ApiController]
public class SearchController(ISearchService searchService) : ControllerBase
{
    private readonly ISearchService _searchService = searchService;

    [HttpGet("projects")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ProjectHeaderDto>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SearchProjects([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Search query parameter cannot be empty.");
        }

        var results = await _searchService.SearchAsync<ProjectHeaderDto>(query);
        return Ok(results);
    }

    [HttpGet("parts")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PartDetailDto>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SearchParts([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Search query parameter cannot be empty.");
        }

        var results = await _searchService.SearchAsync<PartDetailDto>(query);
        return Ok(results);
    }
}
