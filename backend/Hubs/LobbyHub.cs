using Core.Interfaces;
using Core.Models.Lobby;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class LobbyHub : Hub
{
    private readonly ILobbyStateManager _lobbyStateManager;
    private readonly ITableService _tableService;
    private readonly IUserService _userService;

    public LobbyHub(ILobbyStateManager lobbyStateManager, ITableService tableService, IUserService userService)
    {
        _lobbyStateManager = lobbyStateManager;
        _tableService = tableService;
        _userService = userService;
    }

    public async Task CreateLobby(int tableId)
    {
        var user = await _userService.GetLoggedInUser(Context.User!);
        if (user is null)
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }
        
        var existingLobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(user.Id);
        if (existingLobbyId is not null)
        {
            var existingLobby = await _lobbyStateManager.GetLobbyStateAsync(existingLobbyId);
            if (existingLobby is not null)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{existingLobbyId}");
                await Clients.Caller.SendAsync("LobbyCreated", existingLobby);
                return;
            }
        }
        
        var tableResult = await _tableService.GetTableByIdAsync(tableId);
        if (tableResult.IsFailed)
        {
            await Clients.Caller.SendAsync("Error", "Table not found");
            return;
        }
        
        if (user.Balance < tableResult.Value.BuyIn)
        {
            await Clients.Caller.SendAsync("Error", $"Insufficient balance. Need ${tableResult.Value.BuyIn}");
            return;
        }

        var lobby = new LobbyState
        {
            HostUserId = user.Id,
            HostUsername = user.UserName,
            TableId = tableId,
            Players = new List<LobbyPlayer>
            {
                new LobbyPlayer
                {
                    UserId =  user.Id,
                    Username = user.UserName,
                    IsHost =  true,
                    IsReady = false
                }
            }
        };
        
        await _lobbyStateManager.SaveLobbyStateAsync(lobby.LobbyId, lobby);
        await _lobbyStateManager.SetUserCurrentLobbyAsync(user.Id, lobby.LobbyId);
        await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{lobby.LobbyId}");
        await Clients.Caller.SendAsync("LobbyCreated", lobby);
    }
}