using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.DomainEntities;
using Domain.RepositoryInterface;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Repository
{
    public class RequisitionRepository : GenericRepository<RequisitionDomain, Requisition>, IRequisitionRepository
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public RequisitionRepository(
            AppDbContext todoAppDbContext,
            IMapper mapper) : base(todoAppDbContext, mapper)
        {
            _context = todoAppDbContext;
            _mapper = mapper;
        }

        public async Task<RequisitionDomain> GetByRecNoAsync(string recNo)
        {
            var requisition = await _context.Requisitions
                .Include(r => r.Parts)
                .FirstOrDefaultAsync(r => r.RecNo == recNo);

            return _mapper.Map<RequisitionDomain>(requisition);
        }

        public async Task<(List<RequisitionDomain> Items, int Total)> GetPaginatedAsync(
            int page,
            int pageSize,
            string status = null,
            string search = null,
            string sortBy = null,
            string sortOrder = null)
        {
            var query = _context.Requisitions.Include(r => r.Parts).AsQueryable();

            // Filter by status
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(r =>
                    r.RecNo.Contains(search) ||
                    r.ProductName.Contains(search) ||
                    r.ProjectNo.Contains(search));
            }

            // Get total before pagination
            int total = await query.CountAsync();

            // Sort
            if (!string.IsNullOrEmpty(sortBy))
            {
                bool descending = sortOrder?.Equals("desc", StringComparison.OrdinalIgnoreCase) ?? false;

                query = sortBy.ToLower() switch
                {
                    "recno" => descending ? query.OrderByDescending(r => r.RecNo) : query.OrderBy(r => r.RecNo),
                    "date" => descending ? query.OrderByDescending(r => r.Date) : query.OrderBy(r => r.Date),
                    "status" => descending ? query.OrderByDescending(r => r.Status) : query.OrderBy(r => r.Status),
                    _ => query.OrderByDescending(r => r.CreatedAt)
                };
            }
            else
            {
                query = query.OrderByDescending(r => r.CreatedAt);
            }

            // Pagination
            var requisitions = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var mapped = _mapper.Map<List<RequisitionDomain>>(requisitions);
            return (mapped, total);
        }

        public async Task<bool> RecNoExistsAsync(string recNo)
        {
            return await _context.Requisitions.AnyAsync(r => r.RecNo == recNo);
        }

        // --- NEW UPDATED METHODS ---

        public async Task UpdateAsync(RequisitionDomain domainEntity)
        {
            // Fetch the existing tracked database entity including child collection
            var trackedEntity = await _context.Requisitions
                .Include(r => r.Parts)
                .FirstOrDefaultAsync(r => r.RecNo == domainEntity.RecNo);

            if (trackedEntity != null)
            {
                // Map updated domain data into existing tracked entity to maintain EF state tracking
                _mapper.Map(domainEntity, trackedEntity);
            }
            else
            {
                // Fallback: if not tracked yet, map and update explicitly
                var entity = _mapper.Map<Requisition>(domainEntity);
                _context.Requisitions.Update(entity);
            }
        }

        public async Task DeleteAsync(RequisitionDomain domainEntity)
        {
            // Fetch tracked record to clear safely along with cascade behaviors
            var trackedEntity = await _context.Requisitions
                .FirstOrDefaultAsync(r => r.RecNo == domainEntity.RecNo);

            if (trackedEntity != null)
            {
                _context.Requisitions.Remove(trackedEntity);
            }
            else
            {
                var entity = _mapper.Map<Requisition>(domainEntity);
                _context.Requisitions.Remove(entity);
            }
        }

        public async Task CommitAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
