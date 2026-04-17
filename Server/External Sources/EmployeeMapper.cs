using JanaticsApi.Domain.Entities;

namespace JanaticsApi.Features.Employees;

public static class EmployeeMapper
{
    public static HodDto ToHodDto(Employee e) => new(
        e.EmployeeId, e.FirstName, e.LastName,
        e.Username, e.Email, e.Mobile, e.Location, e.Role, e.IsActive);

    public static EmployeeDto ToDto(Employee e) => new(
        e.EmployeeId,
        e.FirstName,
        e.LastName,
        e.Username,
        e.Email,
        e.Mobile,
        e.Location,
        e.Role,
        e.IsActive,
        e.CreatedOn,
        e.UpdatedOn,
        e.DepartmentId,
        e.Department is null ? null : new DepartmentDetailDto(
            e.Department.DepartmentId,
            e.Department.DepartmentName,
            e.Department.Hod is null ? null : ToHodDto(e.Department.Hod))
    );
}
