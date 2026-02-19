using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class GameHub : Hub
{
    private readonly IGameStateManager _gameStateManager;

    public GameHub(IGameStateManager gameStateManager)
    {
        _gameStateManager = gameStateManager;
    }
    
    
}