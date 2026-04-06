using FileAccessPortal.Api.Common.Contracts;
using FileAccessPortal.Api.Common.Endpoints;
using FileAccessPortal.Api.Common.Storage;
using Microsoft.AspNetCore.OutputCaching;

namespace FileAccessPortal.Api.Features.System;

public sealed class SystemEndpoints : IEndpointModule
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/system").WithTags("System");

        group.MapGet("/health", () => TypedResults.Ok(new
        {
            name = "File Access Portal API",
            status = "ok",
            workflow = "User -> HOD Approval -> IT Grant / Reject / Resubmit / Renew / Revoke",
            timestampUtc = DateTimeOffset.UtcNow
        }))
        .CacheOutput("system-cache");

        group.MapGet("/seed-users", async Task<IResult> (PortalStore store, CancellationToken cancellationToken) =>
            TypedResults.Ok((await store.GetUsersAsync(cancellationToken)).Select(user => user.ToResponse()).ToArray()))
            .CacheOutput("system-cache");
    }
}
