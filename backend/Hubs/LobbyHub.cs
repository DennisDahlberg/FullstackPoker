using Application.Services;
using Core.Interfaces;
using Core.Models.Lobby;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class LobbyHub : Hub
{
    private readonly ILobbyStateManager _lobbyStateManager;
    private readonly ITableService _tableService;
    private readonly IUserService _userService;
    private readonly IGameService _gameService;
    private readonly IGameStateManager _gameStateManager;
    private readonly BotService _botService;

    public LobbyHub(ILobbyStateManager lobbyStateManager, ITableService tableService, IUserService userService, BotService botService, IGameService gameService, IGameStateManager gameStateManager)
    {
        _lobbyStateManager = lobbyStateManager;
        _tableService = tableService;
        _userService = userService;
        _botService = botService;
        _gameService = gameService;
        _gameStateManager = gameStateManager;
    }

    public async Task CreateLobby(int tableId)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var user = await _userService.GetUserById(userId ?? "");
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

    public async Task StartGame()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var lobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(userId);

        if (lobbyId is null)
        {
            await Clients.Caller.SendAsync("Error", "You are not in a lobby");
            return;
        }

        var lobby = await _lobbyStateManager.GetLobbyStateAsync(lobbyId);
        if (lobby is null)
        {
            await Clients.Caller.SendAsync("Error", "Lobby not found");
            return;
        }

        if (lobby.HostUserId != userId)
        {
            await Clients.Caller.SendAsync("Error", "Only the host can start the game");
            return;
        }

        var totalPlayers = lobby.Players.Count + lobby.BotIds.Count;
        if (totalPlayers < 2)
        {
            await Clients.Caller.SendAsync("Error", "Need at least 2 players to start");
            return;
        }

        var tableResult = await _tableService.GetTableByIdAsync(lobby.TableId);
        if (tableResult.IsFailed)
        {
            await Clients.Caller.SendAsync("Error", "Table configuration not found");
            return;
        }
        var table = tableResult.Value;

        var botsResult = await _botService.GetBotsForGameAsync(lobby.BotIds);
        if (botsResult.IsFailed)
        {
            await Clients.Caller.SendAsync("Error", "Failed to load bots");
            return;
        }

        foreach (var player in lobby.Players)
        {
            var balanceResult = await _userService.UpdateUserBalanceAsync(player.UserId, -table.BuyIn);
            if (balanceResult.IsFailed)
            {
                await Clients.Caller.SendAsync("Error", $"Player {player.Username} has insufficient balance");
                return;
            }
        }
        
        var userData = await _userService.GetUserDataAsync(userId);
        if (userData.IsFailed)
        {
            await Clients.Caller.SendAsync("Error", "Failed to load user data");
            return;
        }

        var gameState = _gameService.InitializeGame(userData.Value, table, botsResult.Value);

        await _gameStateManager.SaveGameStateAsync(gameState.GameId, gameState);

        foreach (var player in lobby.Players)
        {
            await _gameStateManager.SaveUserCurrentGameAsync(player.UserId, gameState.GameId);
            await _lobbyStateManager.RemoveUserCurrentLobbyAsync(player.UserId);
        }

        await _lobbyStateManager.DeleteLobbyStateAsync(lobbyId);
        
        await Clients.Group($"lobby_{lobbyId}").SendAsync("GameStarted", gameState.GameId);
    }
    
    public async Task LeaveLobby()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var lobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(userId);

        if (lobbyId is null) return;

        var lobby = await _lobbyStateManager.GetLobbyStateAsync(lobbyId);
        if (lobby is null)
        {
            await _lobbyStateManager.RemoveUserCurrentLobbyAsync(userId);
            return;
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lobby_{lobbyId}");
        await _lobbyStateManager.RemoveUserCurrentLobbyAsync(userId);
        
        if (lobby.HostUserId == userId)
        {
            foreach (var player in lobby.Players)
            {
                await _lobbyStateManager.RemoveUserCurrentLobbyAsync(player.UserId);
            }

            await _lobbyStateManager.DeleteLobbyStateAsync(lobbyId);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyClosed", "Host left the lobby");
        }
        else
        {
            lobby.Players.RemoveAll(p => p.UserId == userId);
            await _lobbyStateManager.SaveLobbyStateAsync(lobbyId, lobby);

            var user = await _userService.GetUserById(userId);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("LobbyUpdated", lobby);
            await Clients.Group($"lobby_{lobbyId}").SendAsync("PlayerLeft", user?.UserName ?? "Unknown");
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var userId = _userService.GetLoggedInUserId(Context.User!);
            if (!string.IsNullOrEmpty(userId))
            {
                await LeaveLobby();
            }
        }
        catch
        {
            
        }

        await base.OnDisconnectedAsync(exception);
    }
    
}