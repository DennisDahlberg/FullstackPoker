using Core.DTOs.Bot;
using FluentResults;

namespace Core.Interfaces;

public interface IBotService
{
    Task<List<BotDto>> GetAllBotsAsync();
    Task<Result<List<BotDto>>> GetBotsForGameAsync(List<int> botIds);
}