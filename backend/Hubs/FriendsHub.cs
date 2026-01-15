using System.Reflection.Metadata.Ecma335;
using Application.Services;
using Core.Models;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    [Authorize]
    public class FriendsHub : Hub
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly UserService _userService;
        private readonly FriendService _friendService;
        private static readonly Dictionary<string, HashSet<string>> _userConnections = new();

        public FriendsHub(UserManager<ApplicationUser> userManager, UserService userService, FriendService friendService)
        {
            _userManager = userManager;
            _userService = userService;
            _friendService = friendService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier!;

            lock (_userConnections)
            {
                if (!_userConnections.ContainsKey(userId))
                    _userConnections[userId] = new HashSet<string>();
                _userConnections[userId].Add(Context.ConnectionId);
            }
            
            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier!;

            bool isLastConnection = false;
            lock (_userConnections)
            {
                if (_userConnections.ContainsKey(userId))
                {
                    _userConnections[userId].Remove(Context.ConnectionId);
                    if (_userConnections[userId].Count == 0)
                    {
                        _userConnections.Remove(userId);
                        isLastConnection = true;
                    }
                }
            }

            // if (isLastConnection)
                
            
            return base.OnDisconnectedAsync(exception);
        }

        private async Task NotifyFriendsOfStatusChange(string userId, bool isOnline)
        {
            var friends = await _friendService.GetFriendsAsync(userId);
            // var friendsUserIds = friends.Select(f => f.)
        }
        
        public static bool IsUserOnline(string userId)
        {
            lock (_userConnections)
            {
                return _userConnections.ContainsKey(userId);
            }
        }
    }
}
