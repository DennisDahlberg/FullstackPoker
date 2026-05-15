using Core.DTOs;
using Core.DTOs.Chat;
using Core.Interfaces;
using Core.Models;
using FluentResults;

namespace Application.Services;

public class ChatService : IChatService
{
    private readonly IUserService _userService;
    private readonly IChatRepository _chatRepository;

    public ChatService(IUserService userService, IChatRepository chatRepository)
    {
        _userService = userService;
        _chatRepository = chatRepository;
    }

    public async Task<List<ChatMessageDto>> GetMessagesAsync(string userId, string friendId)
    {
        var messages = await _chatRepository.GetMessagesBetweenUsersAsync(userId, friendId);

        return messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            SenderId = m.SenderId,
            SenderUsername = m.Sender.UserName,
            SenderProfileImageUrl = m.Sender.ProfileImageUrl, 
            RecipientId = m.RecipientId,
            Content = m.Content,
            SentAt = m.SentAt,
            IsRead = m.IsRead,
            IsOwnMessage = m.SenderId == userId,
        }).ToList();
    }

    public async Task<Result> SendMessageAsync(string userId, string recipientId, string content)
    {
        var user = await _userService.GetUserById(userId);
        if (user == null)
            return Result.Fail("User not found");

        var message = new ChatMessage
        {
            SenderId = userId,
            RecipientId = recipientId,
            Content = content,
            SentAt = DateTime.UtcNow,
            IsRead = false,
        };
        
        await _chatRepository.SaveChatMessageAsync(message);
        return Result.Ok();
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(string userId)
    {
        var conversationUserIds = await _chatRepository.GetConversationUserIdsAsync(userId);

        var conversations = new List<ConversationDto>();

        foreach (var friendId in conversationUserIds)
        {
            var friend = await _userService.GetUserById(friendId);
            if (friend == null) continue;
            
            var messages = await _chatRepository.GetMessagesBetweenUsersAsync(userId, friendId);
            var lastMessage = messages.OrderByDescending(m => m.SentAt).FirstOrDefault();

            var unreadCount = await _chatRepository.GetUnreadCountAsync(userId, friendId);

            conversations.Add(new ConversationDto
            {
                FriendId = friendId,
                FriendUsername = friend.UserName,
                FriendProfileImageUrl = friend.ProfileImageUrl,
                LastMessage = lastMessage?.Content,
                LastMessageTime = lastMessage?.SentAt,
                UnreadCount = unreadCount,
                IsOnline = false,
            });
        }

        return conversations.OrderByDescending(c => c.LastMessageTime).ToList();
    }
    
    public async Task MarkMessagesAsReadAsync(string userId, string friendId)
    {
        await _chatRepository.MarkMessagesAsReadAsync(userId, friendId);
    }
}