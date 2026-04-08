using Microsoft.EntityFrameworkCore;
using Server.Infrastructure.Db;

namespace Server.Features.AuditLogs.GetList;

public sealed class GetAuditLogsService(AppDbContext dbContext)
{
    public async Task<IReadOnlyList<AuditLogDto>> GetAsync(CancellationToken cancellationToken)
    {
        var rows = await dbContext.AccessReqAudits
            .AsNoTracking()
            .OrderByDescending(audit => audit.CreatedOn)
            .Take(100)
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
            .Where(employee => actorIds.Contains(employee.EmployeeId))
            .ToDictionaryAsync(employee => employee.EmployeeId, employee => employee.Name, cancellationToken);

        return rows
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
    }
}
