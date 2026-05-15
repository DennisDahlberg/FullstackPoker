using FluentResults;

namespace Core.Interfaces;

public interface IChatService
{
    Task<Result> SendMessageAsync(string userId, string recipientId, string content);
}