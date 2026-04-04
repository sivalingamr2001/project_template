using Server.Domain.Enums;

namespace Server.Application.DTOs;

public record UserResponse(
    int EmployeeId,
    string UserName,
    string Email,
    Roles Role,
    string Location,
    int DepartmentId,
    int PhoneNumber,
    string? DepartmentName,
    HodResponse? Hod
);

public record HodResponse(
    int EmployeeId,
    string UserName,
    string Email
);
