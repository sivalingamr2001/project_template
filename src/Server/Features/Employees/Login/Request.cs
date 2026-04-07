using Server.Common.Contracts;

namespace Server.Features.Users.Login;

public record LoginRequest(int EmployeeId, string Password);

public record LoginResponse(SessionResponse Session);
