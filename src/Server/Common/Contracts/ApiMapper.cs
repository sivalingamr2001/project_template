using Server.Common.Contracts;
using Server.Domain.Entities;

namespace FileAccessPortal.Api.Common.Contracts;

public static class ApiMapper
{
    public static UserResponse ToResponse(this EmployeeEntity employee)
    {
        return new UserResponse(
            employee.EmployeeId,
            employee.Name,
            employee.Email,
            employee.DepartmentId,
            employee.DepartmentName,
            employee.Role);
    }
}
