using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BotRepository
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

    public async Task<Bot?> GetBotByIdAsync(int botId)
    {
        var bot = await _context.Bots.FirstOrDefaultAsync(b => b.Id == botId);
        return bot;
    }
}