using Application.Services;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly FriendService _friendService;
    private readonly IUserService _userService;

    public ChatHub(FriendService friendService, IUserService userService)
    {
        _friendService = friendService;
        _userService = userService;
    }

    public async Task SendMessage(string recipientId, string message)
    {
        var senderId = Context.UserIdentifier;
        
        var sender = await _userService.GetUserById(senderId);
        if (sender == null)
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }

        await Clients.User(recipientId).SendAsync("ReceiveMessage", new
        {
            SenderId = senderId,
            RecipientId = recipientId,
            SenderUsername = sender.UserName,
            SenderProfileImageUrl = sender.ProfileImageUrl,
            Content = message,
            SentAt = DateTime.UtcNow,
            IsOwnMessage = false
        });
        
        await Clients.Caller.SendAsync("ReceiveMessage", new
        {
            SenderId = senderId,
            RecipientId = recipientId,
            SenderUsername = sender.UserName,
            SenderProfileImageUrl = sender.ProfileImageUrl,
            Content = message,
            SentAt = DateTime.Now,
            IsOwnMessage = true
        });
    }
}