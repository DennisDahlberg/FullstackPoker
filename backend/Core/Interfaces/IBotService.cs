using Core.DTOs.Bot;
using FluentResults;

namespace Core.Interfaces;

public interface IBotService
{
    Task<List<BotDto>> GetAllBotsAsync();
    Task<List<BotDto>> GetAllUserCreatedBotsAsync(string userId);
    Task<Result<List<BotDto>>> GetBotsForGameAsync(List<int> botIds);
    Task<Result<BotValidationResultDto>> CreateBotAsync(CreateBotDto botDto);
    Task<Result> UpdateBotAsync(UpdateBotDto botDto);
    Task<Result> DeleteBotAsync(int botId);
}