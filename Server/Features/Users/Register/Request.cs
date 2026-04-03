namespace Server.Features.Users.Register;

public record RegisterRequest(string UserName, string Email, string Password);