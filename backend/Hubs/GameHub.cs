using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class GameHub : Hub
{
    private readonly IGameStateManager _gameStateManager;
    private readonly IUserService _userService;
    private readonly IGameHistoryService _gameHistoryService;
    private readonly IGameService _gameService;
    

    public GameHub(IGameStateManager gameStateManager, IUserService userService, IGameHistoryService gameHistoryService, IGameService gameService)
    {
        _gameStateManager = gameStateManager;
        _userService = userService;
        _gameHistoryService = gameHistoryService;
        _gameService = gameService;
    }

    public async Task JoinGame()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            await Clients.Caller.SendAsync("Error", "No active game found. Please start a new game from the lobby.");
            return;
        }
        
        var gameState = await _gameStateManager.GetGameStateAsync(gameId);
        if (gameState is null)
        {
            await Clients.Caller.SendAsync("Error", "Game state not found");
            return;
        }
        
        await Groups.AddToGroupAsync(Context.ConnectionId, $"game_{gameId}");
        await Clients.Caller.SendAsync("GameStateUpdated", gameState);

        var user = await _userService.GetUserById(userId);
        if (user is not null)
        {
            await Clients.OthersInGroup($"game_{gameId}").SendAsync("PlayerConnected", user.UserName);
        }
    }
}