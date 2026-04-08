using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.AccessRequests.GetList;

public sealed class GetAccessRequestsService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<AccessRequestListItemDto>> GetAsync(
        GetAccessRequestsQuery query,
        CancellationToken cancellationToken)
    {
        var baseQuery =
            from request in dbContext.AccessRequests.AsNoTracking()
            join item in dbContext.AccessItems.AsNoTracking() on request.AccessReqId equals item.AccessReqId
            orderby request.AccessReqId descending
            select new
            {
                request.AccessReqId,
                request.EmpId,
                request.ReqTo,
                request.AggregateStatus,
                request.Status,
                request.ItsrNo,
                request.IsAgreed,
                item.AccessItemId,
                item.FolderPath,
                item.Reason,
                item.AccessType,
            };

        var totalCount = await dbContext.AccessRequests.AsNoTracking().CountAsync(cancellationToken);

        var rows = await baseQuery
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .ToListAsync(cancellationToken);

        var data = rows
            .Select(row => new AccessRequestListItemDto(
                row.AccessReqId,
                row.EmpId,
                row.ReqTo,
                row.AggregateStatus,
                row.Status,
                row.ItsrNo,
                row.IsAgreed,
                row.AccessItemId,
                row.FolderPath,
                row.Reason,
                row.AccessType
            ))
            .ToList();

        return new PaginatedResponse<AccessRequestListItemDto>(data, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }
}
