using Core.DTOs;
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
            RecipientId = m.RecipientId,
            Content = m.Content,
            SentAt = m.SentAt,
            IsRead = m.IsRead,
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
}