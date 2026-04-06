namespace FileAccessPortal.Api.Common.Options;

public sealed class CamundaOptions
{
    public const string SectionName = "Camunda";

    public bool Enabled { get; set; }
    public string BaseUrl { get; set; } = "http://localhost:8080/engine-rest";
    public string ProcessDefinitionKey { get; set; } = "file-access-approval";
    public string StartProcessPath { get; set; } = "process-definition/key/{processDefinitionKey}/start";
    public string MessageCorrelationPath { get; set; } = "message";
    public int TimeoutSeconds { get; set; } = 10;
}
