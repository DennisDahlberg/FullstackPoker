using Core.DTOs;
using Core.DTOs.Chat;
using FluentResults;

namespace Core.Interfaces;

public interface IChatService
{
    Task<Result<ChatMessageDto>> SendMessageAsync(string userId, string recipientId, string content);
    Task<List<ChatMessageDto>> GetMessagesAsync(string userId, string friendId);
    Task<List<ConversationDto>> GetConversationsAsync(string userId);
    Task MarkMessagesAsReadAsync(string userId, string friendId);
}