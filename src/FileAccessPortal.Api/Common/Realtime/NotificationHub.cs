using FileAccessPortal.Api.Common.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FileAccessPortal.Api.Common.Realtime;

[Authorize]
public sealed class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var employeeId = Context.User?.GetEmployeeId()
            ?? throw new HubException("Authenticated employee id claim is missing.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(employeeId));
        await base.OnConnectedAsync();
    }

    public static string GroupName(int employeeId) => $"employee:{employeeId}";
}
