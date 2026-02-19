
using Core.GameModels;
using Core.Interfaces;
using Core.Models.Games;
using Infrastructure.Services;

namespace Application.Services;

public class GameHistoryService : IGameHistoryService
{
    private readonly IGameRepository _gameRepository;
    private readonly IUserService _userService;

    public GameHistoryService(IGameRepository gamerepository, IUserService userService)
    {
        _gameRepository = gamerepository;
        _userService = userService;
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
        
        var playerStats = GetPlayerStatsFromGame(gameState);
        
        await _gameRepository.SaveGameAsync(game,  playerStats);
    }

    public async Task UpdatePlayerBalanceFromGame(GameState gameState)
    {
        foreach (var player in gameState.Players)
        {
            if (player.IsPlayer == false || string.IsNullOrWhiteSpace(player.UserId))
                continue;

            decimal balanceChange = !gameState.IsGameOver ? gameState.EarlyLeavePayout : player.Chips;
            
            await _userService.UpdateUserBalanceAsync(player.UserId, balanceChange);
        }
    }

    private IEnumerable<PlayerGameStat> GetPlayerStatsFromGame(GameState gameState)
    {
        var stats = new List<PlayerGameStat>();

        foreach (var player in gameState.Players)
        {
            if (player.IsPlayer == false)
                continue;

            var playerStat = new PlayerGameStat
            {
                ChipsStart = player.RoundStartingChips,
                ChipsEnd = player.Chips,
                CreatedAt =  DateTimeOffset.UtcNow,
                IsWinner = IsPlayerWinner(gameState, player),
                UserId = player.UserId,
                Profit = player.Chips - player.RoundStartingChips,
            };
            stats.Add(playerStat);
        }
        return stats;
    }

    private bool IsPlayerWinner(GameState state, Player player)
    {
        foreach (var winnerPos in state.WinnersPositions)
        {
            var winner = state.Players[winnerPos];
            if (winner == player)
                return true;
        }
        return false;
    }
}