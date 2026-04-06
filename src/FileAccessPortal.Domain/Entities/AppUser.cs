using FileAccessPortal.Domain.Enums;

namespace FileAccessPortal.Domain.Entities;

public sealed record AppUser(
    int EmployeeId,
    string EmployeeCode,
    string Name,
    string Email,
    int DepartmentId,
    string DepartmentName,
    UserRole Role);
