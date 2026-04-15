using Zeebe.Client;
using Zeebe.Client.Impl.Builder;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Server.Shared.Camunda;

public class CamundaService
{
    private readonly CamundaOptions _options;
    private readonly IZeebeClient _client = null!;

    public CamundaService(IOptions<CamundaOptions> options)
    {
        _options = options.Value;

        if (_options.Enabled)
        {
            _client = CamundaCloudClientBuilder
                .Builder()
                .UseClientId(_options.ClientId)
                .UseClientSecret(_options.ClientSecret)
                .UseContactPoint(_options.Address)
                .Build();
        }
    }

    public bool IsEnabled => _options.Enabled;

    public async Task TestConnectionAsync()
    {
        if (!IsEnabled) return;

        try
        {
            var topology = await _client.TopologyRequest().Send();
            Console.WriteLine("--- Camunda 8 Connection Test ---");
            Console.WriteLine($"Successfully connected to cluster with {topology.Brokers.Count} brokers.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Camunda 8 connection failed: {ex.Message}");
        }
    }

    public async Task StartProcessAsync(string processId, object variables)
    {
        if (!IsEnabled) return;

        await _client.NewCreateProcessInstanceCommand()
            .BpmnProcessId(processId)
            .LatestVersion()
            .Variables(JsonSerializer.Serialize(variables))
            .Send();
    }

    public async Task PublishMessageAsync(string messageName, string correlationKey, object variables)
    {
        if (!IsEnabled) return;

        await _client.NewPublishMessageCommand()
            .MessageName(messageName)
            .CorrelationKey(correlationKey)
            .Variables(JsonSerializer.Serialize(variables))
            .Send();
    }
}
