namespace Server.Domain.Entities;

public class Department
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public int? HodId { get; set; }

    public User? Hod { get; set; }
}
