using Core.GameModels;

namespace Core.Interfaces;

public interface IGameStateManager
{
    Task<GameState?> GetGameStateAsync(string gameId);
    Task SaveGameStateAsync(string gameId, GameState gameState);
    Task DeleteGameStateAsync(string gameId);
    Task<bool> GameExistsAsync(string gameId);
    Task<string?> GetUserCurrentGameAsync(string userId);
    Task SaveUserCurrentGameAsync(string userId, string gameId);
    Task DeleteUserCurrentGameAsync(string userId);
}