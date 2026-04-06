using System.Net.Http.Json;
using FileAccessPortal.Api.Common.Options;
using FileAccessPortal.Domain.Entities;
using Microsoft.Extensions.Options;

namespace FileAccessPortal.Api.Common.Workflow;

public sealed class CamundaWorkflowClient(
    HttpClient httpClient,
    IOptions<CamundaOptions> options,
    ILogger<CamundaWorkflowClient> logger)
    : ICamundaWorkflowClient
{
    private readonly CamundaOptions _options = options.Value;

    public async Task<CamundaProcessReference> StartAccessRequestAsync(FileAccessRequest request, CancellationToken cancellationToken)
    {
        var businessKey = request.TicketNumber;
        if (!_options.Enabled)
        {
            return CreateOfflineReference(businessKey, "request.started");
        }

        var path = _options.StartProcessPath.Replace("{processDefinitionKey}", _options.ProcessDefinitionKey, StringComparison.Ordinal);
        var payload = new
        {
            businessKey,
            variables = new
            {
                requestId = Variable(request.RequestId.ToString()),
                requesterEmployeeId = Variable(request.RequestedByEmployeeId.ToString()),
                requester = Variable(request.RequestedByName),
                department = Variable(request.DepartmentName),
                accessItemCount = Variable(request.Items.Count.ToString()),
                status = Variable(request.AggregateStatus.ToString())
            }
        };

        var response = await httpClient.PostAsJsonAsync(path, payload, cancellationToken);
        response.EnsureSuccessStatusCode();

        var document = await response.Content.ReadFromJsonAsync<StartProcessResponse>(cancellationToken: cancellationToken);
        logger.LogInformation("Started Camunda process for {TicketNumber}", request.TicketNumber);

        return new CamundaProcessReference(
            businessKey,
            document?.Id,
            "request.started",
            DateTimeOffset.UtcNow,
            true);
    }

    public async Task<CamundaProcessReference> PublishStateChangeAsync(FileAccessRequest request, string messageName, CancellationToken cancellationToken)
    {
        var businessKey = request.Camunda?.BusinessKey ?? request.TicketNumber;
        if (!_options.Enabled)
        {
            return CreateOfflineReference(businessKey, messageName);
        }

        var payload = new
        {
            messageName,
            businessKey,
            processVariables = new
            {
                status = Variable(request.AggregateStatus.ToString()),
                approvedUntilUtc = Variable(request.Items.Where(item => item.ApprovedUntilUtc.HasValue).Select(item => item.ApprovedUntilUtc!.Value.ToString("O")).FirstOrDefault() ?? string.Empty),
                rejectionReason = Variable(request.Items.Where(item => !string.IsNullOrWhiteSpace(item.RejectionReason)).Select(item => item.RejectionReason).FirstOrDefault() ?? string.Empty)
            }
        };

        var response = await httpClient.PostAsJsonAsync(_options.MessageCorrelationPath, payload, cancellationToken);
        response.EnsureSuccessStatusCode();
        logger.LogInformation("Published Camunda message {MessageName} for {TicketNumber}", messageName, request.TicketNumber);

        return new CamundaProcessReference(
            businessKey,
            request.Camunda?.ProcessInstanceId,
            messageName,
            DateTimeOffset.UtcNow,
            true);
    }

    private static object Variable(string value)
    {
        return new { value };
    }

    private static CamundaProcessReference CreateOfflineReference(string businessKey, string action)
    {
        return new CamundaProcessReference(
            businessKey,
            null,
            action,
            DateTimeOffset.UtcNow,
            false);
    }

    private sealed record StartProcessResponse(string? Id);
}
