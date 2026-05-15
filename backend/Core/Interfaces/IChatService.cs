using Core.DTOs;
using Core.DTOs.Chat;
using FluentResults;

namespace Core.Interfaces;

public interface IChatService
{
    Task<Result> SendMessageAsync(string userId, string recipientId, string content);
    Task<List<ChatMessageDto>> GetMessagesAsync(string userId, string friendId);
    Task<List<ConversationDto>> GetConversationsAsync(string userId);
}