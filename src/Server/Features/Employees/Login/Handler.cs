using System.Threading;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Infrastructure.Persistence;

namespace Server.Features.Users.Login;

public class LoginHandler(AppDbContext db)
{

    public async Task<EmployeeEntity?> Handle(int employeeId, CancellationToken cancellationToken = default)
    {
        return await db.Employees
            .SingleOrDefaultAsync(user => user.EmployeeId == employeeId, cancellationToken);
    }

}
