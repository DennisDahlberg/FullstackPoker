using System.Text.Json;
using Core.DTOs.Bot;
using Core.Interfaces;
using Core.Models;
using FluentResults;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Mapster;

namespace Application.Services;

public class BotService : IBotService
{
    private readonly IBotRepository _botRepository;
    private readonly BotAiService _botAiService;

    public BotService(IBotRepository botRepository, BotAiService botAiService)
    {
        _botRepository = botRepository;
        _botAiService = botAiService;
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

    public async Task<List<BotDto>> GetAllUserCreatedBotsAsync(string userId)
    {
        var result = await _botRepository.GetAllUserCreatedBotsAsync(userId);
        var bots = result.Select(b => new BotDto
            {
                Id = b.Id,
                Username =  b.Username,
                Description =  b.Description,
                IsUserCreated =  b.IsUserCreated,
                ProfileImageUrl =  b.ProfileImageUrl,
                PlayStyle =  b.PlayStyle,
                SkillLevel = b.SkillLevel.ToString(),
            }
        ).ToList();
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

    public async Task<Result> CreateBotAsync(CreateBotDto botDto)
    {
        var bot =  botDto.Adapt<Bot>();
        bot.IsUserCreated = true;

        await ValidateBotAsync(botDto.Adapt<BotValidationDto>());
        
        var result = await _botRepository.CreateBotAsync(bot);
        return result;
    }

    public async Task<Result> UpdateBotAsync(UpdateBotDto botDto)
    {
        var bot = botDto.Adapt<Bot>();
        bot.IsUserCreated = true;

        var result = await _botRepository.UpdateBotAsync(bot);
        return result;
    }

    public async Task<Result> DeleteBotAsync(int botId)
    {
        return await _botRepository.DeleteBotAsync(botId);
    }

    public async Task<Result<BotValidationResultDto>> ValidateBotAsync(BotValidationDto bot)
    {
        try
        {
            var result = await _botAiService.ValidateBotAsync(bot);
            if (string.IsNullOrEmpty(result))
            {
                return Result.Ok();
            }

            var validation = JsonSerializer.Deserialize<BotValidationResultDto>(result);
            if (validation == null || validation.ValidationErrors.Count == 0)
                return Result.Ok();

            return Result.Fail<BotValidationResultDto>("Validation failed").WithValue(validation);
        }
        catch (Exception ex)
        {
            return Result.Ok();
        }
    }
    
    
}