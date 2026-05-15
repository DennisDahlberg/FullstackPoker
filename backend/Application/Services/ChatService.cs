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