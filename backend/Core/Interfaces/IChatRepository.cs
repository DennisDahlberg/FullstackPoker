using Core.Models;

namespace Core.Interfaces;

public interface IChatRepository
{
    Task SaveChatMessageAsync(ChatMessage message);
    Task<List<ChatMessage>> GetMessagesBetweenUsersAsync(string userId, string friendId);
    Task<List<string>> GetConversationUserIdsAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId, string friendId);
    Task MarkMessagesAsReadAsync(string userId, string friendId);
}