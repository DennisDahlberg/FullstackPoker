using Core.Interfaces;
using Core.Models.Games;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class StatisticRepository : IStatisticRepository
{
    private readonly ApplicationDbContext _context;

    public StatisticRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PlayerGameStat>> GetPlayerGameStatsAsync(string userId)
    {
        var stats = await  _context.PlayerGameStats
            .Where(x => x.UserId == userId)
            .ToListAsync();
        return stats;
    }
}