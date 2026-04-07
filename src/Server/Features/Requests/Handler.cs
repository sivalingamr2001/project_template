using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Persistence;

namespace Server.Features.Requests.Create;

public sealed class AccessRequestHandler(AppDbContext db)
{
    public async Task<AccessRequestResponse> HandleAsync(CreateAccessRequest request, CancellationToken ct)
    {
        var accessRequest = new AccessRequestEntity
        {
            EmpId = request.EmpId,
            ReqTo = request.ReqTo,
            ItsrNo = request.ItsrNo ?? string.Empty,
            IsAgreed = true,
            AggregateStatus = AggregateRequestStatus.Pending,
            Status = RequestStatus.Submitted,
            CreatedBy = request.EmpId.ToString(),
            CreatedOn = DateTime.UtcNow
        };

        db.AccessRequests.Add(accessRequest);

        await db.SaveChangesAsync(ct);

        var items = request.Items.Select(item => new AccessItemEntity
        {
            AccessReqId = accessRequest.AccessReqId,
            FolderPath = item.FolderPath,
            AccessType = (AccessTypes)item.AccessType,
            Reason = item.Reason,
            CreatedBy = request.EmpId.ToString()
        });

        db.AccessItems.AddRange(items);
        await db.SaveChangesAsync(ct);

        return new AccessRequestResponse(accessRequest.AccessReqId, "Created");
    }

    public async Task<List<AccessRequestDetailResponse>> GetAllAsync(CancellationToken ct)
    {
        return await db.AccessRequests
            .AsNoTracking()
            .Join(db.AccessItems,
                req => req.AccessReqId,
                item => item.AccessReqId,
                (req, item) => new { req, item })
            .OrderByDescending(x => x.req.AccessReqId)
            .Select(x => new AccessRequestDetailResponse(
                x.req.AccessReqId,
                x.req.EmpId,
                x.req.ReqTo,
                x.req.AggregateStatus,
                x.req.Status,
                x.req.ItsrNo,
                x.req.IsAgreed,
                x.item.AccessItemId,
                x.item.FolderPath,
                x.item.Reason,
                x.item.AccessType
            ))
            .ToListAsync(ct);
    }
}
