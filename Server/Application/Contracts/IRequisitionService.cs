using Application.DTOs.Request;
using Application.DTOs.Response;

namespace Application.Contracts
{
    public interface IRequisitionService
    {
        Task<RequisitionResponseDto> GetByRecNoAsync(string recNo);

        Task<PaginatedResponseDto<RequisitionResponseDto>> GetPaginatedAsync(
            int page = 1,
            int pageSize = 10,
            string status = null,
            string search = null,
            string sortBy = null,
            string sortOrder = null);

        Task<RequisitionResponseDto> CreateAsync(CreateRequisitionDto dto);

        Task<RequisitionResponseDto> UpdateAsync(string recNo, UpdateRequisitionDto dto);

        Task<RequisitionResponseDto> ApproveAsync(string recNo, ApproveRequisitionDto dto);

        Task<RequisitionResponseDto> SubmitAsync(string recNo, SubmitRequisitionDto dto);

        Task DeleteAsync(string recNo);

        Task<byte[]> ExportAsync(string recNo, string format);

        Task<string> GenerateRecNoAsync();
    }
}
