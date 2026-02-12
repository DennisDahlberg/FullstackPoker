using Core.GameModels;

namespace Core.Interfaces;

public interface IGameHistoryService
{
    Task SaveGameAsync(GameState gameState);
    Task UpdatePlayerBalanceFromGame(GameState gameState);
}