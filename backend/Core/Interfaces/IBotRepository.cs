using Core.Models;
using FluentResults;

namespace Core.Interfaces;

public interface IBotRepository
{
    Task<List<Bot>> GetAllBotsAsync();
    Task<List<Bot>> GetAllUserCreatedBotsAsync(string userId);
    Task<Bot?> GetBotByIdAsync(int botId);
    Task<Result> CreateBotAsync(Bot bot);
    Task<Result> UpdateBotAsync(Bot bot);
    Task<Result> DeleteBotAsync(int botId);
}