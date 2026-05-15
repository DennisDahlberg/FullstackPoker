using Core.Models;

namespace Core.Interfaces;

public interface IChatRepository
{
    Task SaveChatMessageAsync(ChatMessage message);
    Task<List<ChatMessage>> GetMessagesBetweenUsersAsync(string userId, string friendId);
}