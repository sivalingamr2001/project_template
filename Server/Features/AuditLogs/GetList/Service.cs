using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.AuditLogs.GetList;

public sealed class GetAuditLogsService(AppDbContext dbContext)
{
    public async Task<PaginatedResponse<AuditLogDto>> GetAsync(
        GetAuditLogsQuery query,
        CancellationToken cancellationToken)
    {
        var baseQuery = dbContext.AccessReqAudits
            .AsNoTracking()
            .OrderByDescending(audit => audit.CreatedOn);

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var rows = await baseQuery
            .Skip(query.Skip)
            .Take(query.NormalizedPageSize)
            .Select(audit => new
            {
                audit.AuditId,
                audit.AccessReqId,
                audit.CreatedBy,
                audit.CreatedOn,
                audit.EventType,
                audit.Message
            })
            .ToListAsync(cancellationToken);

        var actorIds = rows
            .Select(row => int.TryParse(row.CreatedBy, out var actorId) ? actorId : (int?)null)
            .Where(actorId => actorId.HasValue)
            .Select(actorId => actorId!.Value)
            .Distinct()
            .ToList();

        var actorNames = await dbContext.Employees
            .AsNoTracking()
            .Where(employee => employee.EmployeeId.HasValue && actorIds.Contains(employee.EmployeeId.Value))
            .ToDictionaryAsync(employee => employee.EmployeeId!.Value, employee => employee.Email, cancellationToken);

        var data = rows
            .Select(row =>
            {
                var actorName = int.TryParse(row.CreatedBy, out var actorId)
                    && actorNames.TryGetValue(actorId, out var name)
                    ? name
                    : row.CreatedBy;

                return new AuditLogDto(
                    row.AuditId,
                    actorName,
                    row.EventType,
                    row.AccessReqId,
                    row.CreatedOn,
                    row.Message);
            })
            .ToList();

        return new PaginatedResponse<AuditLogDto>(data, totalCount, query.NormalizedPage, query.NormalizedPageSize);
    }
}
