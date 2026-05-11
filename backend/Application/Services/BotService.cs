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
    private readonly IBlobService _blobService;
    private readonly BotAiService _botAiService;

    public BotService(IBotRepository botRepository, BotAiService botAiService, IBlobService blobService)
    {
        _botRepository = botRepository;
        _botAiService = botAiService;
        _blobService = blobService;
    }

    public async Task<List<BotDto>> GetAllBotsAsync()
    {
        var mainBots = await _botRepository.GetAllBotsAsync();
        var bots = mainBots.Select(b => new BotDto
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
        
        return Result.Ok(bots);
    }

    public async Task<Result<BotValidationResultDto>> CreateBotAsync(CreateBotDto botDto, string userId)
    {
        var bot =  botDto.Adapt<Bot>();
        bot.IsUserCreated = true;
        bot.UserId = userId;

        if (botDto.ProfileImageData != null && !string.IsNullOrEmpty(botDto.ImageType))
            bot.ProfileImageUrl = await UploadBotImageToBlob(botDto.ProfileImageData, botDto.ImageType);
        
        var result = await _botRepository.CreateBotAsync(bot);
        return result;
    }

    public async Task<Result> UpdateBotAsync(UpdateBotDto botDto)
    {
        var bot = botDto.Adapt<Bot>();
        bot.IsUserCreated = true;

        if (botDto.ProfileImageData != null && !string.IsNullOrEmpty(botDto.ImageType))
            bot.ProfileImageUrl = await UploadBotImageToBlob(botDto.ProfileImageData, botDto.ImageType);
        
        var result = await _botRepository.UpdateBotAsync(bot);
        return result;
    }

    public async Task<Result> DeleteBotAsync(int botId)
    {
        return await _botRepository.DeleteBotAsync(botId);
    }

    public async Task<BotValidationResultDto> ValidateBotAsync(BotValidationDto bot)
    {
        try
        {
            var result = await _botAiService.ValidateBotAsync(bot);
            if (string.IsNullOrEmpty(result))
            {
                return new BotValidationResultDto();
            }

            var validation = JsonSerializer.Deserialize<BotValidationResultDto>(result);
            if (validation == null || validation.ValidationErrors.Count == 0)
                return new BotValidationResultDto();

            return validation;
        }
        catch (Exception ex)
        {
            return new BotValidationResultDto();
        }
    }

    public async Task<string> UploadBotImageToBlob(byte[] imageData, string imageType)
    {
        using var stream = new MemoryStream(imageData);
        var extension = imageType == "image/png" ? ".png" : ".jpg";
        var fileName = $"{Guid.NewGuid()}{extension}";
        var imageUrl = await _blobService.UploadImage(stream, fileName, imageType);
        
        return imageUrl;
    }
    
}