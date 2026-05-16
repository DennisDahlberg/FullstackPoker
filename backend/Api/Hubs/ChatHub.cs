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
    private readonly IChatService _chatService;

    public ChatHub(FriendService friendService, IUserService userService, IChatService chatService)
    {
        _friendService = friendService;
        _userService = userService;
        _chatService = chatService;
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
        
        var recipient = await _userService.GetUserById(recipientId);
        if (recipient == null)
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }
        
        var result = await _chatService.SendMessageAsync(senderId, recipientId, message);
        if (result.IsFailed)
        {
            await Clients.Caller.SendAsync("Error", result.Errors.First().Message);
            return;
        }

        await Clients.User(recipientId).SendAsync("ReceiveMessage", new
        {
            Id = result.Value.Id,
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
            Id = result.Value.Id,
            SenderId = senderId,
            RecipientId = recipientId,
            SenderUsername = recipient.UserName,
            SenderProfileImageUrl = recipient.ProfileImageUrl,
            Content = message,
            SentAt = DateTime.Now,
            IsOwnMessage = true
        });
    }
}