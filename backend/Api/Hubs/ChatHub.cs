using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    
}