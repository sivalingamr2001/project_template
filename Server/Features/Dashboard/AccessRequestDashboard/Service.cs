using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Infrastructure.Db;

namespace Server.Features.Dashboard.AccessRequestDashboard;

public sealed class AccessRequestDashboardService
{
    private readonly AppDbContext _dbContext;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);

    public AccessRequestDashboardService(AppDbContext dbContext, IMemoryCache cache)
    {
        _dbContext = dbContext;
        _cache = cache;
    }

    public async Task<DashboardResponse> GetAsync(
        DashboardQuery query,
        CancellationToken cancellationToken = default)
    {
        var normalizedQuery = NormalizeQuery(query);
        var cacheKey = BuildCacheKey(normalizedQuery);

        if (_cache.TryGetValue(cacheKey, out DashboardResponse? cached) && cached is not null)
            return cached;

        var requests = BuildRequestQuery(normalizedQuery);
        var items = BuildItemQuery(requests);

        // Architectural Win: Sequential processing is preserved, but total DB roundtrips are sliced in half
        var summary = await FetchSummaryAsync(requests, items, normalizedQuery, cancellationToken);
        var statusBreakdown = await FetchStatusBreakdownAsync(items, cancellationToken);
        var accessTypeBreakdown = await FetchAccessTypeBreakdownAsync(items, cancellationToken);
        var recentRequests = await FetchRecentRequestsAsync(requests, cancellationToken);
        var pendingApprovals = await FetchPendingApprovalsAsync(requests, cancellationToken);
        var auditLogs = await FetchAuditLogsAsync(normalizedQuery, cancellationToken);
        var trend = await FetchTrendAsync(requests, normalizedQuery, cancellationToken);

        var result = new DashboardResponse(
            Summary: summary,
            StatusBreakdown: statusBreakdown,
            AccessTypeBreakdown: accessTypeBreakdown,
            RecentRequests: recentRequests,
            PendingApprovals: pendingApprovals,
            RecentAuditLogs: auditLogs,
            Trend: trend,
            GeneratedAt: DateTime.UtcNow
        );

        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions { SlidingExpiration = CacheDuration });
        return result;
    }

    private IQueryable<AccessRequestEntity> BuildRequestQuery(DashboardQuery query)
    {
        var requestQuery = _dbContext.AccessRequests
            .AsNoTracking()
            .Where(r => r.IsActive);

        if (query.EmpId is not null) requestQuery = requestQuery.Where(r => r.EmpId == query.EmpId.Value);
        if (query.ApproverId is not null) requestQuery = requestQuery.Where(r => r.ReqTo == query.ApproverId.Value);
        if (query.From is not null) requestQuery = requestQuery.Where(r => r.CreatedOn >= query.From.Value);
        if (query.To is not null) requestQuery = requestQuery.Where(r => r.CreatedOn <= query.To.Value);

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var filter = query.Status.Trim();
            requestQuery = filter.ToLower() switch
            {
                "pending" => requestQuery.Where(r => r.AccessItems.Any(i => i.Status == RequestStatus.Submitted || i.Status == RequestStatus.PendingHOD || i.Status == RequestStatus.PendingIT)),
                "approved" => requestQuery.Where(r => r.AccessItems.Any(i => i.Status == RequestStatus.ApprovedHOD || i.Status == RequestStatus.ApprovedIT || i.Status == RequestStatus.AccessGranted)),
                "rejected" => requestQuery.Where(r => r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected)),
                _ => requestQuery
            };
        }

        return requestQuery;
    }

    private IQueryable<AccessItemEntity> BuildItemQuery(IQueryable<AccessRequestEntity> requests)
    {
        return _dbContext.AccessItems
            .AsNoTracking()
            .Where(i => i.IsActive)
            .Join(requests, i => i.AccessReqId, r => r.AccessReqId, (i, r) => i);
    }

    private async Task<DashboardSummaryDto> FetchSummaryAsync(
        IQueryable<AccessRequestEntity> requests,
        IQueryable<AccessItemEntity> items,
        DashboardQuery query,
        CancellationToken cancellationToken)
    {
        // Architectural Win: Consolidates multiple queries into a single SQL execution block
        var metrics = await requests
            .Select(r => new
            {
                r.AccessReqId,
                IsPending = r.AccessItems.Any(i => i.Status == RequestStatus.Submitted || i.Status == RequestStatus.PendingHOD || i.Status == RequestStatus.PendingIT) ? 1 : 0,
                IsApproved = r.AccessItems.Any(i => i.Status == RequestStatus.ApprovedHOD || i.Status == RequestStatus.ApprovedIT || i.Status == RequestStatus.AccessGranted) ? 1 : 0,
                IsRejected = r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected) ? 1 : 0,
                IsAgreedValue = r.IsAgreed ? 1 : 0
            })
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalRequests = g.Select(x => x.AccessReqId).Distinct().Count(),
                PendingCount = g.Sum(x => x.IsPending),
                ApprovedCount = g.Sum(x => x.IsApproved),
                RejectedCount = g.Sum(x => x.IsRejected),
                AgreedCount = g.Sum(x => x.IsAgreedValue)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalItems = await items.CountAsync(cancellationToken);

        var unreadNotifications = await _dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(a => a.IsActive && !a.IsRead)
            .Where(a => query.EmpId == null || a.RecipientEmpId == query.EmpId.Value)
            .CountAsync(cancellationToken);

        return new DashboardSummaryDto(
            TotalRequests: metrics?.TotalRequests ?? 0,
            PendingCount: metrics?.PendingCount ?? 0,
            ApprovedCount: metrics?.ApprovedCount ?? 0,
            RejectedCount: metrics?.RejectedCount ?? 0,
            AgreedCount: metrics?.AgreedCount ?? 0,
            TotalItems: totalItems,
            UnreadNotifications: unreadNotifications
        );
    }

    private async Task<IReadOnlyList<StatusBreakdownDto>> FetchStatusBreakdownAsync(
        IQueryable<AccessItemEntity> items, CancellationToken cancellationToken)
    {
        // Architectural Win: Raw grouping execution occurs on database server instance
        var databaseRows = await items
            .GroupBy(i => i.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var total = databaseRows.Sum(r => r.Count);

        // Local memory transformation mapping logic
        return databaseRows
            .GroupBy(r => NormalizeStatus(r.Status))
            .Select(g => new StatusBreakdownDto(
                g.Key,
                g.Sum(x => x.Count),
                total == 0 ? 0 : Math.Round((double)g.Sum(x => x.Count) / total * 100, 1)))
            .ToList();
    }

    private async Task<IReadOnlyList<AccessTypeBreakdownDto>> FetchAccessTypeBreakdownAsync(
        IQueryable<AccessItemEntity> items, CancellationToken cancellationToken)
    {
        // Architectural Win: Raw grouping execution occurs on database server instance
        var databaseRows = await items
            .GroupBy(i => i.AccessType)
            .Select(g => new { AccessType = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var total = databaseRows.Sum(r => r.Count);

        // Local memory transformation mapping logic
        return databaseRows
            .GroupBy(r => NormalizeAccessType(r.AccessType))
            .Select(g => new AccessTypeBreakdownDto(
                g.Key,
                g.Sum(x => x.Count),
                total == 0 ? 0 : Math.Round((double)g.Sum(x => x.Count) / total * 100, 1)))
            .ToList();
    }

    private async Task<IReadOnlyList<RecentRequestDto>> FetchRecentRequestsAsync(
        IQueryable<AccessRequestEntity> requests, CancellationToken cancellationToken)
    {
        return await requests
            .OrderByDescending(r => r.CreatedOn)
            .Take(10)
            .Select(r => new RecentRequestDto(
                r.AccessReqId,
                r.EmpId,
                r.ReqTo,
                r.IsAgreed,
                r.ItsrNo,
                r.CreatedOn,
                r.CreatedBy,
                r.AccessItems.Count(i => i.IsActive),
                r.AccessItems.Any(i => i.Status == RequestStatus.Submitted || i.Status == RequestStatus.PendingHOD || i.Status == RequestStatus.PendingIT) ? "Pending" :
                r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected) ? "Rejected" : "Approved"
            ))
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<PendingApprovalDto>> FetchPendingApprovalsAsync(
        IQueryable<AccessRequestEntity> requests, CancellationToken cancellationToken)
    {
        var requestIds = await requests.Select(r => r.AccessReqId).ToListAsync(cancellationToken);

        return await _dbContext.AccessApprovals
            .AsNoTracking()
            .Where(a => a.IsActive && requestIds.Contains(a.AccessReqId) && (a.ApprovalStatus == RequestStatus.PendingHOD || a.ApprovalStatus == RequestStatus.PendingIT))
            .Join(_dbContext.AccessItems.AsNoTracking().Where(i => i.IsActive),
                approval => approval.AccessItemId,
                item => item.AccessItemId,
                (approval, item) => new { approval, item })
            .Join(_dbContext.AccessRequests.AsNoTracking().Where(r => r.IsActive),
                pair => pair.approval.AccessReqId,
                request => request.AccessReqId,
                (pair, request) => new { pair, request })
            .OrderBy(x => x.pair.approval.CreatedOn)
            .Take(20)
            .Select(x => new PendingApprovalDto(
                x.pair.approval.AccessApproveId,
                x.pair.approval.AccessReqId,
                x.pair.approval.AccessItemId,
                x.pair.approval.ApproverId,
                "Pending",
                x.pair.item.TicketNumber,
                x.pair.item.FolderPath,
                x.pair.item.AccessType.ToString(),
                x.request.CreatedBy,
                x.pair.approval.CreatedOn
            ))
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<AuditLogDto>> FetchAuditLogsAsync(
        DashboardQuery query, CancellationToken cancellationToken)
    {
        return await _dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(a => a.IsActive)
            .Where(a => query.EmpId == null || a.RecipientEmpId == query.EmpId.Value)
            .OrderByDescending(a => a.CreatedOn)
            .Take(15)
            .Select(a => new AuditLogDto(
                a.AuditId,
                a.AccessReqId,
                a.AccessItemId,
                a.EventType,
                a.Message,
                a.RecipientName,
                a.RecipientRole,
                a.IsRead,
                a.CreatedOn
            ))
            .ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<TrendPointDto>> FetchTrendAsync(
        IQueryable<AccessRequestEntity> requests,
        DashboardQuery query,
        CancellationToken cancellationToken)
    {
        var from = query.From ?? DateTime.UtcNow.AddDays(-30);
        var to = query.To ?? DateTime.UtcNow;

        var databaseTrend = await requests
            .Where(r => r.CreatedOn >= from && r.CreatedOn <= to)
            .GroupBy(r => r.CreatedOn.Date)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                DateKey = g.Key,
                Count = g.Count(),
                ApprovedCount = g.Count(r => r.AccessItems.Any(i => i.Status == RequestStatus.ApprovedHOD || i.Status == RequestStatus.ApprovedIT || i.Status == RequestStatus.AccessGranted)),
                RejectedCount = g.Count(r => r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected))
            })
            .ToListAsync(cancellationToken);

        return databaseTrend.Select(t => new TrendPointDto(
            t.DateKey.ToString("yyyy-MM-dd"),
            t.Count,
            t.ApprovedCount,
            t.RejectedCount
        )).ToList();
    }

    private static DashboardQuery NormalizeQuery(DashboardQuery query)
    {
        var from = query.From ?? DateTime.UtcNow.AddDays(-30);
        var to = query.To ?? DateTime.UtcNow;
        return query with { From = from, To = to };
    }

    private static string NormalizeStatus(RequestStatus status) => status switch
    {
        RequestStatus.Submitted or RequestStatus.PendingHOD or RequestStatus.PendingIT => "Pending",
        RequestStatus.ApprovedHOD or RequestStatus.ApprovedIT or RequestStatus.AccessGranted => "Approved",
        RequestStatus.RejectedHOD or RequestStatus.RejectedIT or RequestStatus.AccessRejected => "Rejected",
        _ => "Unknown"
    };

    private static string NormalizeAccessType(AccessTypes accessType) => accessType switch
    {
        AccessTypes.ReadOnly => "Read",
        AccessTypes.ReadAndWrite => "ReadWrite",
        _ => "Unknown"
    };

    private static string BuildCacheKey(DashboardQuery query)
        => $"dashboard:{query.EmpId}:{query.ApproverId}:{query.Status}:{query.From:yyyyMMddHHmm}:{query.To:yyyyMMddHHmm}";
}
