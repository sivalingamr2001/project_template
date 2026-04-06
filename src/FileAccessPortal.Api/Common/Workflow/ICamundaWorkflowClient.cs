using FileAccessPortal.Domain.Entities;

namespace FileAccessPortal.Api.Common.Workflow;

public interface ICamundaWorkflowClient
{
    Task<CamundaProcessReference> StartAccessRequestAsync(FileAccessRequest request, CancellationToken cancellationToken);
    Task<CamundaProcessReference> PublishStateChangeAsync(FileAccessRequest request, string messageName, CancellationToken cancellationToken);
}
