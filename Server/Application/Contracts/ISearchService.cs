using Application.DTOs.Request;

namespace Application.Contracts;

public interface ISearchService
{
    Task<IEnumerable<ProjectHeaderDto>> SearchProjectsAsync(string query);
    Task<IEnumerable<PartDetailDto>> SearchPartsAsync(string query);
}
