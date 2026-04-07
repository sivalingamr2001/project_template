using FileAccessPortal.Api.Common.Auth;
using FileAccessPortal.Api.Common.Endpoints;
using FileAccessPortal.Api.Common.Contracts;
using FileAccessPortal.Api.Common.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace FileAccessPortal.Api.Features.Requests;

public sealed class RequestEndpoints : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/requests").WithTags("Requests").RequireAuthorization();

        group.MapGet("/me", async Task<IResult> (HttpContext httpContext, PortalStore store, CancellationToken cancellationToken) =>
        {
            var employeeId = httpContext.User.GetEmployeeId();
            var requests = await store.GetVisibleRequestsAsync(employeeId, cancellationToken);
            return TypedResults.Ok(requests.Select(request => request.ToResponse()).ToArray());
        });

        group.MapPost("/", async Task<IResult> (HttpContext httpContext, CreateRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var employeeId = httpContext.User.GetEmployeeId();
            var created = await store.CreateRequestAsync(
                employeeId,
                request.Items.Select(item => new PortalStore.AccessItemDraft(
                    item.FileName,
                    item.FolderPath,
                    item.AccessType,
                    item.BusinessReason)).ToArray(),
                cancellationToken);

            return TypedResults.Created($"/api/requests/{created.RequestId}", created.ToResponse());
        });

        group.MapPut("/{requestId:int}/items/{accessItemId:int}", async Task<IResult> (HttpContext httpContext, int requestId, int accessItemId, UpdateRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var updated = await store.UpdateRequestAsync(
                requestId,
                accessItemId,
                httpContext.User.GetEmployeeId(),
                request.Items.Select(item => new PortalStore.AccessItemDraft(
                    item.FileName,
                    item.FolderPath,
                    item.AccessType,
                    item.BusinessReason)).ToArray(),
                cancellationToken);

            return TypedResults.Ok(updated.ToResponse());
        });

        group.MapPost("/{requestId:int}/items/{accessItemId:int}/hod-review", async Task<IResult> (HttpContext httpContext, int requestId, int accessItemId, HodReviewRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var updated = await store.ReviewAccessItemByHodAsync(requestId, accessItemId, httpContext.User.GetEmployeeId(), request.Approved, request.Note, cancellationToken);
            return TypedResults.Ok(updated.ToResponse());
        });

        group.MapPost("/{requestId:int}/items/{accessItemId:int}/it-review", async Task<IResult> (HttpContext httpContext, int requestId, int accessItemId, ItReviewRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var updated = await store.ReviewAccessItemByItAsync(requestId, accessItemId, httpContext.User.GetEmployeeId(), request.Approved, request.Note, cancellationToken);
            return TypedResults.Ok(updated.ToResponse());
        });

        group.MapPost("/{requestId:int}/items/{accessItemId:int}/resubmit", async Task<IResult> (HttpContext httpContext, int requestId, int accessItemId, ResubmitRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var updated = await store.ResubmitAccessItemAsync(
                requestId,
                accessItemId,
                httpContext.User.GetEmployeeId(),
                request.AccessType,
                request.BusinessReason,
                cancellationToken);
            return TypedResults.Ok(updated.ToResponse());
        });

        group.MapPost("/{requestId:int}/renew", async Task<IResult> (HttpContext httpContext, int requestId, RenewRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var renewal = await store.RenewAccessItemsAsync(requestId, httpContext.User.GetEmployeeId(), request.AccessItemIds, cancellationToken);
            return TypedResults.Created($"/api/requests/{renewal.RequestId}", renewal.ToResponse());
        });

        group.MapPost("/{requestId:int}/items/{accessItemId:int}/revoke", async Task<IResult> (HttpContext httpContext, int requestId, int accessItemId, RevokeRequest request, PortalStore store, CancellationToken cancellationToken) =>
        {
            var updated = await store.RevokeAccessItemAsync(requestId, accessItemId, httpContext.User.GetEmployeeId(), request.Note, cancellationToken);
            return TypedResults.Ok(updated.ToResponse());
        });
    }

    private sealed record CreateRequest(IReadOnlyList<CreateAccessItem> Items);

    private sealed record CreateAccessItem(string FileName, string FolderPath, string AccessType, string BusinessReason);

    private sealed record UpdateRequest(IReadOnlyList<UpdateAccessItem> Items);

    private sealed record UpdateAccessItem(string FileName, string FolderPath, string AccessType, string BusinessReason);

    private sealed record HodReviewRequest(bool Approved, string? Note);

    private sealed record ItReviewRequest(bool Approved, string? Note);

    private sealed record ResubmitRequest(string AccessType, string BusinessReason);

    private sealed record RenewRequest(IReadOnlyList<int> AccessItemIds);

    private sealed record RevokeRequest(string? Note);
}
