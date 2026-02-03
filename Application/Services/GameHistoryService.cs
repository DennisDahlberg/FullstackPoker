using Core.GameModels;
using Core.Interfaces;
using Core.Models.Games;

namespace Application.Services;

public class GameHistoryService : IGameHistoryService
{
    public void SaveGameAsync(GameState gameState)
    {
        var game = new Game
        {
            FinishedAt =  DateTime.Now,
            TableId = gameState.TableId,
        };
    }
}