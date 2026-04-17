using Server.Shared.Helpers;

namespace Server.Features.Departments.Create;

public sealed record CreateDepartmentRequest(int DeptId, string Name, int HodId);
