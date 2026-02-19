using Core.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class LobbyHub : Hub
{
    private readonly ILobbyStateManager _lobbyStateManager;

    public LobbyHub(ILobbyStateManager lobbyStateManager)
    {
        _lobbyStateManager = lobbyStateManager;
    }
    
    
}