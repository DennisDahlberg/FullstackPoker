using Core.Models;

namespace Core.Interfaces;

public interface IBotRepository
{
    Task<List<Bot>> GetAllBotsAsync();
    Task<List<Bot>> GetAllUserCreatedBotsAsync(string userId);
    Task<Bot?> GetBotByIdAsync(int botId);
}