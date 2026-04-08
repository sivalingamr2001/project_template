using Microsoft.AspNetCore.SignalR;

namespace Server.Common.Realtime;

public sealed class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var employeeIdValue = Context.GetHttpContext()?.Request.Query["employeeId"].ToString();

        if (!int.TryParse(employeeIdValue, out var employeeId) || employeeId <= 0)
        {
            throw new HubException("A valid employeeId query parameter is required.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(employeeId));
        await base.OnConnectedAsync();
    }

    public static string GroupName(int employeeId) => $"employee:{employeeId}";
}
