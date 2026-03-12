using Core.DTOs.Bot;
using FluentResults;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Mapster;

namespace Application.Services;

public class BotService
{
    private readonly BotRepository _botRepository;

    public BotService(BotRepository botRepository)
    {
        _botRepository = botRepository;
    }

    public async Task<List<BotDto>> GetAllBotsAsync()
    {
        var result = await _botRepository.GetAllBotsAsync();
        var bots = result.Select(b => new BotDto
        {
            Id = b.Id,
            Username =  b.Username,
            Description =  b.Description,
            IsUserCreated =  b.IsUserCreated,
            ProfileImageUrl =   b.ProfileImageUrl,
            PlayStyle =  b.PlayStyle,
            SkillLevel = b.SkillLevel.ToString()
        }).ToList();
        return bots;
    }

    public async Task<Result<List<BotDto>>> GetBotsForGameAsync(List<int> botIds)
    {
        var bots = new List<BotDto>();
        foreach (var id in botIds)
        {
            var bot = await _botRepository.GetBotByIdAsync(id);
            if (bot != null)
                bots.Add(bot.Adapt<BotDto>());
        }

        if (bots.Count == 0)
            return Result.Fail("No bots were found");
        
        return Result.Ok(bots);
    }
}