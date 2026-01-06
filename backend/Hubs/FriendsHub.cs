using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    [Authorize]
    public class FriendsHub : Hub
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public FriendsHub(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task SendFriendInviteAsync(string touserId, string fromUsername)
        {
            var user = await _userManager.FindByIdAsync(touserId);
            await Clients.User(touserId).SendAsync("ReceiveFriendInvite", fromUsername);
        }
    }
}
