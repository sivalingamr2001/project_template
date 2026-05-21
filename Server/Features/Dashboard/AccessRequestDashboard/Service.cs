using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Server.Domain.Entities;
using Server.Domain.Enums;
using Server.Features.Dashboard.AccessRequestDashboard;
using Server.Infrastructure.Db;

public class AccessRequestDashboardService
{
    private readonly AppDbContext _dbContext;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

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

        if (query.EmpId is not null) requestQuery = requestQuery.Where(r => r.UserId == query.EmpId.Value);
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
                "revoked" => requestQuery.Where(r => r.AccessItems.Any(i => i.Status == RequestStatus.Revoked)),
                _ => requestQuery
            };
        }

        return requestQuery;
    }

    private IQueryable<AccessItemEntity> BuildItemQuery(IQueryable<AccessRequestEntity> requests)
    {
        // FIXED: Replaced standard Join method chain with explicit LINQ query format
        return from item in _dbContext.AccessItems.AsNoTracking()
               join req in requests on item.AccessReqId equals req.AccessReqId
               where item.IsActive
               select item;
    }

    private async Task<DashboardSummaryDto> FetchSummaryAsync(
        IQueryable<AccessRequestEntity> requests,
        IQueryable<AccessItemEntity> items,
        DashboardQuery query,
        CancellationToken cancellationToken)
    {
        var metrics = await requests
            .Select(r => new
            {
                r.AccessReqId,
                IsPending = r.AccessItems.Any(i => i.Status == RequestStatus.Submitted || i.Status == RequestStatus.PendingHOD || i.Status == RequestStatus.PendingIT) ? 1 : 0,
                IsApproved = r.AccessItems.Any(i => i.Status == RequestStatus.ApprovedHOD || i.Status == RequestStatus.ApprovedIT || i.Status == RequestStatus.AccessGranted) ? 1 : 0,
                IsRejected = r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected) ? 1 : 0,
                IsRevoked = r.AccessItems.Any(i => i.Status == RequestStatus.Revoked) ? 1 : 0,
                IsAgreedValue = r.IsAgreed ? 1 : 0
            })
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalRequests = g.Select(x => x.AccessReqId).Distinct().Count(),
                PendingCount = g.Sum(x => x.IsPending),
                ApprovedCount = g.Sum(x => x.IsApproved),
                RejectedCount = g.Sum(x => x.IsRejected),
                RevokedCount = g.Sum(x => x.IsRevoked),
                AgreedCount = g.Sum(x => x.IsAgreedValue)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var totalItems = await items.CountAsync(cancellationToken);

        var unreadNotifications = await _dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(a => a.IsActive && !a.IsRead)
            .Where(a => query.ApproverId == null || a.RecipientUserId == query.ApproverId.Value)
            .CountAsync(cancellationToken);

        return new DashboardSummaryDto(
            TotalRequests: metrics?.TotalRequests ?? 0,
            PendingCount: metrics?.PendingCount ?? 0,
            ApprovedCount: metrics?.ApprovedCount ?? 0,
            RejectedCount: metrics?.RejectedCount ?? 0,
            RevokedCount: metrics?.RevokedCount ?? 0,
            AgreedCount: metrics?.AgreedCount ?? 0,
            TotalItems: totalItems,
            UnreadNotifications: unreadNotifications
        );
    }

    private async Task<IReadOnlyList<StatusBreakdownDto>> FetchStatusBreakdownAsync(
        IQueryable<AccessItemEntity> items, CancellationToken cancellationToken)
    {
        var databaseRows = await items
            .GroupBy(i => i.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var total = databaseRows.Sum(r => r.Count);

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
        var databaseRows = await items
            .GroupBy(i => i.AccessType)
            .Select(g => new { AccessType = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var total = databaseRows.Sum(r => r.Count);

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
        // FIXED: Swapped fluent syntax chain out for clean explicit LINQ queries
        var query = from r in requests
                    join emp in _dbContext.Employees.AsNoTracking() on r.UserId equals emp.UserId
                    join app in _dbContext.Employees.AsNoTracking() on r.ReqTo equals app.UserId
                    orderby r.CreatedOn descending
                    select new RecentRequestDto(
                        r.AccessReqId,
                        emp.Email,
                        app.Email,
                        r.IsAgreed,
                        r.ItsrNo,
                        r.CreatedOn,
                        r.CreatedBy,
                        r.AccessItems.Count(i => i.IsActive),
                        r.AccessItems.Any(i => i.Status == RequestStatus.Submitted || i.Status == RequestStatus.PendingHOD || i.Status == RequestStatus.PendingIT) ? "Pending" :
                        r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected) ? "Rejected" :
                        r.AccessItems.Any(i => i.Status == RequestStatus.Revoked) ? "Revoked" : "Approved"
                    );

        return await query.Take(10).ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<PendingApprovalDto>> FetchPendingApprovalsAsync(
        IQueryable<AccessRequestEntity> requests, CancellationToken cancellationToken)
    {
        var requestIds = await requests.Select(r => r.AccessReqId).ToListAsync(cancellationToken);

        // FIXED: Flat query block guarantees key validation checks type matching across models
        var query = from approval in _dbContext.AccessApprovals.AsNoTracking()
                    where approval.IsActive && requestIds.Contains(approval.AccessReqId) &&
                          (approval.ApprovalStatus == RequestStatus.PendingHOD || approval.ApprovalStatus == RequestStatus.PendingIT)
                    join item in _dbContext.AccessItems.AsNoTracking() on approval.AccessItemId equals item.AccessItemId
                    where item.IsActive
                    join req in _dbContext.AccessRequests.AsNoTracking() on approval.AccessReqId equals req.AccessReqId
                    where req.IsActive
                    join approverUser in _dbContext.Employees.AsNoTracking() on approval.ApproverId equals approverUser.UserId
                    join requestorUser in _dbContext.Employees.AsNoTracking() on req.UserId equals requestorUser.UserId
                    orderby approval.CreatedOn
                    select new PendingApprovalDto(
                        approval.AccessApproveId,
                        approval.AccessReqId,
                        approval.AccessItemId,
                        approverUser.Email,
                        "Pending",
                        item.TicketNumber,
                        item.FolderPath,
                        item.AccessType.ToString(),
                        requestorUser.Email,
                        approval.CreatedOn
                    );

        return await query.Take(20).ToListAsync(cancellationToken);
    }

    private async Task<IReadOnlyList<AuditLogDto>> FetchAuditLogsAsync(
        DashboardQuery query, CancellationToken cancellationToken)
    {
        return await _dbContext.AccessReqAudits
            .AsNoTracking()
            .Where(a => a.IsActive)
            .Where(a => query.ApproverId == null || a.RecipientUserId == query.ApproverId.Value)
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
                RejectedCount = g.Count(r => r.AccessItems.Any(i => i.Status == RequestStatus.RejectedHOD || i.Status == RequestStatus.RejectedIT || i.Status == RequestStatus.AccessRejected)),
                RevokedCount = g.Count(r => r.AccessItems.Any(i => i.Status == RequestStatus.Revoked))
            })
            .ToListAsync(cancellationToken);

        return databaseTrend.Select(t => new TrendPointDto(
            t.DateKey.ToString("yyyy-MM-dd"),
            t.Count,
            t.ApprovedCount,
            t.RejectedCount,
            t.RevokedCount
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
        RequestStatus.Revoked => "Revoked",
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
