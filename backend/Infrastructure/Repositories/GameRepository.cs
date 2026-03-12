using System.Runtime.InteropServices.ComTypes;
using Core.Interfaces;
using Core.Models.Games;
using Infrastructure.Data;

namespace Infrastructure.Repositories;

public class GameRepository : IGameRepository
{
    private readonly ApplicationDbContext _dbContext;

    public GameRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task SaveGameAsync(Game game, IEnumerable<PlayerGameStat> playerStats)
    {
        await using var tx = await _dbContext.Database.BeginTransactionAsync();
        
        try
        {
            _dbContext.Games.Add(game);
            await _dbContext.SaveChangesAsync();

            foreach (var stats in playerStats)
                stats.GameId = game.Id;

            _dbContext.PlayerGameStats.AddRange(playerStats);
            await _dbContext.SaveChangesAsync();

            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
        }
    }
}