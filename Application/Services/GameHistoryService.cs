using Core.GameModels;
using Core.Interfaces;
using Core.Models.Games;

namespace Application.Services;

public class GameHistoryService : IGameHistoryService
{
    private readonly IGameRepository _gameRepository;

    public GameHistoryService(IGameRepository gamerepository)
    {
        _gameRepository = gamerepository;
    }

    public async Task SaveGameAsync(GameState gameState)
    {
        var winnerIds =  new List<string>();
        foreach (var winner in gameState.WinnersPositions)
            winnerIds.Add(gameState.Players[winner].UserId);
        
        var game = new Game
        {
            FinishedAt =  DateTimeOffset.UtcNow,
            TableId = gameState.TableId,
            StartedAt = gameState.StartedAt,
            WinnerIds = winnerIds,
        };
        
        await _gameRepository.SaveGameAsync(game);
    }
}