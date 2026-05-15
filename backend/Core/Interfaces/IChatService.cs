using Core.DTOs;
using FluentResults;

namespace Core.Interfaces;

public interface IChatService
{
    Task<Result> SendMessageAsync(string userId, string recipientId, string content);
    Task<List<ChatMessageDto>> GetMessagesAsync(string userId, string friendId);
}