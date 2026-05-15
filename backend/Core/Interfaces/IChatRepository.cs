using Core.Models;

namespace Core.Interfaces;

public interface IChatRepository
{
    Task SaveChatMessageAsync(ChatMessage message);
}