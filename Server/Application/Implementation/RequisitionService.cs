using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Contracts;
using Application.DTOs.Request;
using Application.DTOs.Response;
using Domain.DomainEntities;
using Domain.RepositoryInterface;

namespace Application.Implementation
{
    public class RequisitionService : IRequisitionService
    {
        private readonly IRequisitionRepository _requisitionRepository;
        private readonly IMapper _mapper;

        public RequisitionService(IRequisitionRepository requisitionRepository, IMapper mapper)
        {
            _requisitionRepository = requisitionRepository;
            _mapper = mapper;
        }

        public async Task<RequisitionResponseDto> GetByRecNoAsync(string recNo)
        {
            var requisition = await _requisitionRepository.GetByRecNoAsync(recNo);
            if (requisition == null)
            {
                throw new KeyNotFoundException($"Requisition {recNo} not found");
            }

            return _mapper.Map<RequisitionResponseDto>(requisition);
        }

        public async Task<PaginatedResponseDto<RequisitionResponseDto>> GetPaginatedAsync(
            int page = 1,
            int pageSize = 10,
            string status = null,
            string search = null,
            string sortBy = null,
            string sortOrder = null)
        {
            var (items, total) = await _requisitionRepository.GetPaginatedAsync(page, pageSize, status, search, sortBy, sortOrder);

            var mappedItems = _mapper.Map<List<RequisitionResponseDto>>(items);

            int totalPages = (int)Math.Ceiling((double)total / pageSize);

            return new PaginatedResponseDto<RequisitionResponseDto>(
                mappedItems,
                new PaginationDto(total, page, pageSize, totalPages)
            );
        }

        public async Task<RequisitionResponseDto> CreateAsync(CreateRequisitionDto dto)
        {
            var requisitionDomain = new RequisitionDomain
            {
                Date = dto.Date,
                PageNo = dto.PageNo,
                FromTeam = dto.FromTeam,
                ToTeam = dto.ToTeam,
                ProductNo = dto.ProductNo,
                ProductRev = dto.ProductRev,
                ProjectNo = dto.ProjectNo,
                ProductName = dto.ProductName,
                Purpose = dto.Purpose,
                MonthlyQty = int.Parse(dto.MonthlyQty),
                Status = "draft",
                PreparedBy = dto.Prepared.Name,
                PreparedDate = DateTime.Parse(dto.Prepared.Date),
                CheckedBy = null,
                CheckedDate = null,
                ApprovedBy = null,
                ApprovedDate = null,
                ReceivedBy = null,
                ReceivedDate = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Parts = dto.Parts?.Select((p, index) => new PartDomain
                {
                    SNo = index + 1,
                    PartNo = p.PartNo,
                    Rev = p.Rev,
                    PartName = p.PartName,
                    Qty = p.Qty,
                    RequiredDate = p.RequiredDate,
                    CommittedDate = p.CommittedDate,
                    ActualCompletionDate = p.ActualCompletionDate
                }).ToList() ?? new List<PartDomain>()
            };

            // Generate RecNo
            requisitionDomain.RecNo = await GenerateRecNoAsync();

            await _requisitionRepository.AddAsync(requisitionDomain);
            await _requisitionRepository.CommitAsync();

            return _mapper.Map<RequisitionResponseDto>(requisitionDomain);
        }

        public async Task<RequisitionResponseDto> UpdateAsync(string recNo, UpdateRequisitionDto dto)
        {
            var requisition = await _requisitionRepository.GetByRecNoAsync(recNo);
            if (requisition == null)
            {
                throw new KeyNotFoundException($"Requisition {recNo} not found");
            }

            // Only draft and pending can be updated
            if (requisition.Status != "draft" && requisition.Status != "pending")
            {
                throw new InvalidOperationException("Cannot update approved requisition. Only draft and pending requisitions can be modified.");
            }

            requisition.Date = dto.Date;
            requisition.PageNo = dto.PageNo;
            requisition.FromTeam = dto.FromTeam;
            requisition.ToTeam = dto.ToTeam;
            requisition.ProductNo = dto.ProductNo;
            requisition.ProductRev = dto.ProductRev;
            requisition.ProjectNo = dto.ProjectNo;
            requisition.ProductName = dto.ProductName;
            requisition.Purpose = dto.Purpose;
            requisition.MonthlyQty = int.Parse(dto.MonthlyQty);
            requisition.UpdatedAt = DateTime.UtcNow;

            // Update parts
            requisition.Parts = dto.Parts?.Select((p, index) => new PartDomain
            {
                SNo = index + 1,
                PartNo = p.PartNo,
                Rev = p.Rev,
                PartName = p.PartName,
                Qty = p.Qty,
                RequiredDate = p.RequiredDate,
                CommittedDate = p.CommittedDate,
                ActualCompletionDate = p.ActualCompletionDate
            }).ToList() ?? new List<PartDomain>();

            await _requisitionRepository.UpdateAsync(requisition);
            await _requisitionRepository.CommitAsync();

            return _mapper.Map<RequisitionResponseDto>(requisition);
        }

        public async Task<RequisitionResponseDto> ApproveAsync(string recNo, ApproveRequisitionDto dto)
        {
            var requisition = await _requisitionRepository.GetByRecNoAsync(recNo);
            if (requisition == null)
            {
                throw new KeyNotFoundException($"Requisition {recNo} not found");
            }

            if (requisition.Status != "pending")
            {
                throw new InvalidOperationException("Only pending requisitions can be approved");
            }

            requisition.Status = "approved";
            requisition.ApprovedBy = dto.ApprovedBy;
            requisition.ApprovedDate = DateTime.Parse(dto.ApprovalDate);
            requisition.UpdatedAt = DateTime.UtcNow;

            await _requisitionRepository.UpdateAsync(requisition);
            await _requisitionRepository.CommitAsync();

            return _mapper.Map<RequisitionResponseDto>(requisition);
        }

        public async Task<RequisitionResponseDto> SubmitAsync(string recNo, SubmitRequisitionDto dto)
        {
            var requisition = await _requisitionRepository.GetByRecNoAsync(recNo);
            if (requisition == null)
            {
                throw new KeyNotFoundException($"Requisition {recNo} not found");
            }

            if (requisition.Status != "draft")
            {
                throw new InvalidOperationException("Only draft requisitions can be submitted");
            }

            // Validate at least one part
            if (requisition.Parts == null || !requisition.Parts.Any())
            {
                throw new InvalidOperationException("At least one part must be added before submission");
            }

            requisition.Status = "pending";
            requisition.CheckedBy = dto.CheckedBy;
            requisition.CheckedDate = DateTime.Parse(dto.CheckDate);
            requisition.UpdatedAt = DateTime.UtcNow;

            await _requisitionRepository.UpdateAsync(requisition);
            await _requisitionRepository.CommitAsync();

            return _mapper.Map<RequisitionResponseDto>(requisition);
        }

        public async Task DeleteAsync(string recNo)
        {
            var requisition = await _requisitionRepository.GetByRecNoAsync(recNo);
            if (requisition == null)
            {
                throw new KeyNotFoundException($"Requisition {recNo} not found");
            }

            // Only draft can be deleted
            if (requisition.Status != "draft")
            {
                throw new InvalidOperationException("Only draft requisitions can be deleted");
            }

            await _requisitionRepository.DeleteAsync(requisition);
            await _requisitionRepository.CommitAsync();
        }

        public async Task<byte[]> ExportAsync(string recNo, string format = "pdf")
        {
            var requisition = await _requisitionRepository.GetByRecNoAsync(recNo);
            if (requisition == null)
            {
                throw new KeyNotFoundException($"Requisition {recNo} not found");
            }

            // Simple export - just return placeholder bytes
            // In production, use iTextSharp for PDF or EPPlus for Excel
            string content = $"Requisition: {requisition.RecNo}\nProduct: {requisition.ProductName}";
            return System.Text.Encoding.UTF8.GetBytes(content);
        }

        private async Task<string> GenerateRecNoAsync()
        {
            var now = DateTime.UtcNow;
            var year = now.Year;
            
            // Get all requisitions for current year
            var allRequisitions = await _requisitionRepository.GetAllAsync();
            var currentYearCount = allRequisitions
                .Where(r => r.CreatedAt.Year == year)
                .Count();

            return $"REC-{year}-{(currentYearCount + 1).ToString("D3")}";
        }
    }
}
