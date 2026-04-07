using Microsoft.EntityFrameworkCore;
using Server.Features.Requests.Create;
using Server.Infrastructure.Persistence;

namespace Server.Features.Dashboard;

public class DashboardHandler(AppDbContext db)
{
    public async Task<List<AccessRequestDetailResponse>> GetPortalDataAsync(int empId, CancellationToken ct)
    {
        var profile = await db.Employees
            .AsNoTracking()
            .Where(e => e.EmployeeId == empId)
            .Select(e => new { e.Role, e.DepartmentName })
            .FirstOrDefaultAsync(ct);

        if (profile == null) return [];

        var query = db.AccessRequests
            .AsNoTracking()
            .Join(db.AccessItems,
                req => req.AccessReqId,
                item => item.AccessReqId,
                (req, item) => new { req, item });

        if (profile.Role == "ItTeam")
        { }
        else
        {
            query = profile.Role == "Hod"
                ? query.Join(db.Employees,
                combined => combined.req.EmpId,
                emp => emp.EmployeeId,
                (combined, emp) => new { combined.req, combined.item, emp })
                .Where(x => x.emp.DepartmentName == profile.DepartmentName)
                .Select(x => new { x.req, x.item })
                : query.Where(x => x.req.EmpId == empId);
        }

        return await query
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
