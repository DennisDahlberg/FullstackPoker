using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class FriendsHub : Hub
    {
        public async Task SendFriendInviteAsync(string touserId, string fromUsername)
        {
            await Clients.User(touserId).SendAsync("ReceiveFriendInvite", fromUsername);
        }
    }
}
