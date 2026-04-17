using JanaticsApi.Domain.Entities;

namespace JanaticsApi.Features.Departments;

public static class DepartmentMapper
{
    public static DepartmentDto ToDto(Department d) => new(
        d.DepartmentId,
        d.DepartmentName,
        d.CreatedOn,
        d.UpdatedOn,
        d.HodId,
        d.Hod is null ? null : new HodSummaryDto(
            d.Hod.EmployeeId,
            d.Hod.FirstName,
            d.Hod.LastName,
            d.Hod.Email,
            d.Hod.Mobile,
            d.Hod.Role)
    );
}
