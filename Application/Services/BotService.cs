using Core.DTOs.Bot;
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
            Username =  b.Username,
            Description =  b.Description,
            IsUserCreated =  b.IsUserCreated,
            ProfileImageUrl =   b.ProfileImageUrl,
            PlayStyle =  b.PlayStyle,
            SkillLevel = b.SkillLevel.ToString()
        }).ToList();
        return bots;
    }
}