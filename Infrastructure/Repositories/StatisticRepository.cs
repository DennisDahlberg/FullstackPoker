using Core.DTOs.Statistics;
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

    public async Task<(List<PlayerGameStatJoined> Items, int Total)> GetPlayerGameStatsAsync(string userId, int page, int pageSize)
    {
        var query = _context.PlayerGameStats
            .Where(x => x.UserId == userId)
            .Join(
                _context.Games,
                stat => stat.GameId,
                game => game.Id,
                (stat, game) => new PlayerGameStatJoined { Stat = stat, Game = game })
            .OrderByDescending(x => x.Game.FinishedAt);

        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return (items, total);
    }
}