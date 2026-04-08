using Server.Features.AccessRequests.Common;

namespace Server.Features.AccessRequests.Create;

public sealed class CreateAccessRequestService(AccessRequestWorkflowService workflowService)
{
    public async Task<CreateAccessRequestResponse> CreateAsync(CreateAccessRequest request, CancellationToken cancellationToken)
    {
        return await workflowService.CreateOrUpdateAsync(request, cancellationToken);
    }
}
