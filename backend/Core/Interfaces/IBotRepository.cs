using Core.Models;

namespace Core.Interfaces;

public interface IBotRepository
{
    Task<List<Bot>> GetAllBotsAsync();
    Task<Bot?> GetBotByIdAsync(int botId);
}