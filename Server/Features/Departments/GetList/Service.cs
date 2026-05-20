using System.Configuration;
using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Server.Domain.Entities;
using Server.Features.Common;
using Server.Features.HOD;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;
using static Server.Features.Auth.Login.LoginService;
using static Server.Features.Employees.EmployeeService;

namespace Server.Features.Departments.GetList;

public sealed class GetDepartmentsService(AppDbContext dbContext)
{
    /// <summary>
    /// Fetch data from cmpl user and hod table, validate if existing same email id or employee id.
    /// Create a local department record if valid, and return the local department data with pagination.
    /// </summary>
    public async Task<DepartmentResponse> GetDepartmentsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken)
    {

        var query = from dept in dbContext.Departments
                    join hod in dbContext.Employees on dept.HodUserId equals hod.UserId into hodJoin
                    from hod in hodJoin.DefaultIfEmpty()
                    select new DepartmentResponse
                    {
                        DepartmentId = dept.DepartmentId,
                        Name = dept.Name,
                        HodUserId = dept.HodUserId,
                        HodEmail = hod != null ? hod.Email : null
                    };
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(d => d.DepartmentId)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return new DepartmentResponse(items, totalCount, pageNumber, pageSize);
    }
}
