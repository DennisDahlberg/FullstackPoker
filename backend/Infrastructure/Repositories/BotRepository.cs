using Core.DTOs.Bot;
using Core.Interfaces;
using Core.Models;
using FluentResults;
using Infrastructure.Data;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BotRepository : IBotRepository
{
    private readonly ApplicationDbContext _context;

    public BotRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<Bot>> GetAllBotsAsync()
    {
        var bots = await _context.Bots.ToListAsync();
        return bots;
    }

    public async Task<List<Bot>> GetAllUserCreatedBotsAsync(string userId)
    {
        var bots = await _context.Bots
            .Where(b => b.IsUserCreated == true)
            .Where(b => b.UserId == userId)
            .ToListAsync();

        return bots;
    }

    public async Task<Bot?> GetBotByIdAsync(int botId)
    {
        var bot = await _context.Bots.FirstOrDefaultAsync(b => b.Id == botId);
        return bot;
    }

    public async Task<Result> CreateBotAsync(Bot bot)
    {
        try
        {
            await _context.Bots.AddAsync(bot);
            await _context.SaveChangesAsync();
            return Result.Ok();
        }
        catch (Exception ex)
        {
            return Result.Fail(ex.Message);
        }
        
    }

    public async Task<Result> UpdateBotAsync(Bot bot)
    {
        try
        {
            var botToUpdate = await _context.Bots.FirstOrDefaultAsync(b => b.Id == bot.Id);
            if (botToUpdate == null)
                return Result.Fail("Bot not found");
            
            bot.Adapt(botToUpdate);
            
            _context.Bots.Update(botToUpdate);
            await _context.SaveChangesAsync();

            return Result.Ok();
        }
        catch (Exception ex)
        {
            return Result.Fail(ex.Message);
        }
    }
}