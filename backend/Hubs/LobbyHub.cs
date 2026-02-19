using Application.Services;
using Core.Interfaces;
using Core.Models.Lobby;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class LobbyHub : Hub
{
    private readonly ILobbyStateManager _lobbyStateManager;
    private readonly ITableService _tableService;
    private readonly IUserService _userService;
    private readonly BotService _botService;

    public LobbyHub(ILobbyStateManager lobbyStateManager, ITableService tableService, IUserService userService, BotService botService)
    {
        _lobbyStateManager = lobbyStateManager;
        _tableService = tableService;
        _userService = userService;
        _botService = botService;
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

    public async Task AddBotToLobby(int botId)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var lobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(userId);
        
        if (lobbyId == null)
        {
            await Clients.Caller.SendAsync("Error", "You are not in a lobby");
            return;
        }

        var lobby = await _lobbyStateManager.GetLobbyStateAsync(lobbyId);
        if (lobby == null)
        {
            await Clients.Caller.SendAsync("Error", "Lobby not found");
            return;
        }
        
        if (lobby.HostUserId != userId)
        {
            await Clients.Caller.SendAsync("Error", "Only the host can add bots");
            return;
        }
        
        var botsResult = await _botService.GetBotsForGameAsync(new List<int> { botId });
        if (botsResult.IsFailed || botsResult.Value.Count == 0)
        {
            await Clients.Caller.SendAsync("Error", "Invalid bot");
            return;
        }
        
        int totalPlayers = lobby.Players.Count + lobby.BotIds.Count;
        if (totalPlayers >= 8)
        {
            await Clients.Caller.SendAsync("Error", "Lobby is full");
            return;
        }
        
        lobby.BotIds.Add(botId);
        await _lobbyStateManager.SaveLobbyStateAsync(lobbyId, lobby);
        await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
        await Clients.Group($"lobby_{lobbyId}").SendAsync("BotAdded", botsResult.Value[0].Username);
    }

    public async Task RemoveBotFromLobby(int botId)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var lobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(userId);
        
        if (lobbyId == null)
        {
            await Clients.Caller.SendAsync("Error", "You are not in a lobby");
            return;
        }

        var lobby = await _lobbyStateManager.GetLobbyStateAsync(lobbyId);
        if (lobby == null)
        {
            await Clients.Caller.SendAsync("Error", "Lobby not found");
            return;
        }
        
        if (lobby.HostUserId != userId)
        {
            await Clients.Caller.SendAsync("Error", "Only the host can remove bots");
            return;
        }
        
        if (lobby.BotIds.Remove(botId))
        {
            await _lobbyStateManager.SaveLobbyStateAsync(lobbyId, lobby);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("BotRemoved", botId);
        }
    }
    
}