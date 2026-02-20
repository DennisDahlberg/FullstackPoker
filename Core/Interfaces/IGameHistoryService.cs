using Core.GameModels;
using Core.Models.Games;

namespace Core.Interfaces;

public interface IGameHistoryService
{
    Task SaveGameAsync(GameState gameState);
    Task UpdatePlayerBalanceFromGame(GameState gameState);
    PlayerSessionSummary GetGameSessionForPlayer(Player player, GameState gameState);
}