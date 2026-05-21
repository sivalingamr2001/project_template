using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.DomainEntities;

namespace Domain.RepositoryInterface
{
    public interface IRequisitionRepository : IGenericRepository<RequisitionDomain>
    {
        Task<RequisitionDomain> GetByRecNoAsync(string recNo);
        Task<(List<RequisitionDomain> Items, int Total)> GetPaginatedAsync(
            int page, 
            int pageSize, 
            string status = null, 
            string search = null, 
            string sortBy = null, 
            string sortOrder = null);
        Task<bool> RecNoExistsAsync(string recNo);

        Task UpdateAsync(RequisitionDomain requisition);
        Task DeleteAsync(RequisitionDomain requisition);
        Task<string> GenerateReqNo();
    }
}
