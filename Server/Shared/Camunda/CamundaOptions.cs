namespace Server.Shared.Camunda;

public class CamundaOptions
{
    public bool Enabled { get; set; }
    public string Address { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}
