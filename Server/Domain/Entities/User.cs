using System.ComponentModel.DataAnnotations;

namespace Server.Domain.Entities;

public class User
{
    public int Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public required string Email { get; set; }

    public required string Password { get; set; } = string.Empty;
}