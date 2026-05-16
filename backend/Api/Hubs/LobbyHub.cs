using Application.Services;
using Core.DTOs;
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
    private readonly IBotService _botService;
    private readonly IHubContext<FriendsHub> _friendsHubContext;

    public LobbyHub(ILobbyStateManager lobbyStateManager, ITableService tableService, IUserService userService, IBotService botService, IGameService gameService, IGameStateManager gameStateManager, IHubContext<FriendsHub> friendsHubContext)
    {
        _lobbyStateManager = lobbyStateManager;
        _tableService = tableService;
        _userService = userService;
        _botService = botService;
        _gameService = gameService;
        _gameStateManager = gameStateManager;
        _friendsHubContext = friendsHubContext;
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
            HostProfileImageUrl = user.ProfileImageUrl,
            TableId = tableId,
            Players = new List<LobbyPlayer>
            {
                new LobbyPlayer
                {
                    UserId =  user.Id,
                    Username = user.UserName,
                    IsHost =  true,
                    ProfileImageUrl = user.ProfileImageUrl,
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

        var playerIds = new List<UserDTO>();
        foreach (var player in lobby.Players)
        {
            var balanceResult = await _userService.UpdateUserBalanceAsync(player.UserId, -table.BuyIn);
            if (balanceResult.IsFailed)
            {
                await Clients.Caller.SendAsync("Error", $"Player {player.Username} has insufficient balance");
                return;
            }

            var userData = await _userService.GetUserDataAsync(player.UserId);
            if (userData.IsFailed)
            {
                await Clients.Caller.SendAsync("Error", "Failed to load user data");
                return;
            }
            playerIds.Add(userData.Value);
        }

        var gameState = _gameService.InitializeGame(playerIds, table, botsResult.Value);

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

    public async Task InvitePlayer(string friendId)
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
            await Clients.Caller.SendAsync("Error", "Only the host can invite players");
            return;
        }

        if (lobby.Players.Any(p => p.UserId == friendId))
        {
            await Clients.Caller.SendAsync("Error", "Player is already in the lobby");
            return;
        }

        var totalPlayers = lobby.Players.Count + lobby.BotIds.Count;
        if (totalPlayers >= 8)
        {
            await Clients.Caller.SendAsync("Error", "Lobby is full");
            return;
        }

        var invitedUser = await _userService.GetUserById(friendId);
        if (invitedUser is null)
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }

        var user = await _userService.GetUserById(userId);
        if (user is null)
        {
            await Clients.Caller.SendAsync("Error", "Host not found");
            return;
        }

        var invite = new LobbyInvite
        {
            LobbyId = lobbyId,
            HostUsername = lobby.HostUsername,
            HostProfileImageUrl = user.ProfileImageUrl,
            TableId = lobby.TableId,
            InvitedUserId = friendId
        };

        await _lobbyStateManager.SaveInviteAsync(invite.InviteId, invite);
        await _lobbyStateManager.AddUserInviteAsync(friendId, invite.InviteId);

        var invitePayload = new
        {
            invite.InviteId,
            invite.LobbyId,
            invite.HostUsername,
            invite.TableId,
            invite.SentAt
        };

        // Send via LobbyHub (if user is connected)
        await Clients.User(friendId).SendAsync("LobbyInviteReceived", invitePayload);

        // Also send via FriendsHub (always connected)
        await _friendsHubContext.Clients.User(friendId)
            .SendAsync("LobbyInviteReceived", invitePayload);

        await Clients.Caller.SendAsync("InviteSent", invitedUser.UserName);
    }
    
    public async Task AcceptInvite(string inviteId)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var user = await _userService.GetUserById(userId);

        if (user is null)
        {
            await Clients.Caller.SendAsync("Error", "User not found");
            return;
        }

        var invite = await _lobbyStateManager.GetInviteAsync(inviteId);
        if (invite is null)
        {
            await Clients.Caller.SendAsync("Error", "Invite not found or expired");
            return;
        }

        if (invite.InvitedUserId != userId)
        {
            await Clients.Caller.SendAsync("Error", "This invite is not for you");
            return;
        }

        var lobby = await _lobbyStateManager.GetLobbyStateAsync(invite.LobbyId);
        if (lobby is null)
        {
            await _lobbyStateManager.DeleteInviteAsync(inviteId);
            await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);
            await Clients.Caller.SendAsync("Error", "Lobby no longer exists");
            return;
        }

        var existingLobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(userId);
        if (existingLobbyId is not null)
        {
            await Clients.Caller.SendAsync("Error", "You are already in a lobby. Leave it first.");
            return;
        }

        var totalPlayers = lobby.Players.Count + lobby.BotIds.Count;
        if (totalPlayers >= 8)
        {
            await Clients.Caller.SendAsync("Error", "Lobby is full");
            return;
        }

        // Check balance
        var tableResult = await _tableService.GetTableByIdAsync(lobby.TableId);
        if (tableResult.IsFailed)
        {
            await Clients.Caller.SendAsync("Error", "Table configuration not found");
            return;
        }

        if (user.Balance < tableResult.Value.BuyIn)
        {
            await Clients.Caller.SendAsync("Error", $"Insufficient balance. Need ${tableResult.Value.BuyIn}");
            return;
        }

        lobby.Players.Add(new LobbyPlayer
        {
            UserId = user.Id,
            Username = user.UserName,
            IsHost = false,
            IsReady = false
        });

        await _lobbyStateManager.SaveLobbyStateAsync(invite.LobbyId, lobby);
        await _lobbyStateManager.SetUserCurrentLobbyAsync(userId, invite.LobbyId);

        await _lobbyStateManager.DeleteInviteAsync(inviteId);
        await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);

        await Groups.AddToGroupAsync(Context.ConnectionId, $"lobby_{invite.LobbyId}");

        await Clients.Group($"lobby_{invite.LobbyId}").SendAsync("LobbyUpdated", lobby);
        await Clients.Group($"lobby_{invite.LobbyId}").SendAsync("PlayerJoined", user.UserName);

        await Clients.Caller.SendAsync("JoinedLobby", lobby);
    }

    public async Task DeclineInvite(string inviteId)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);

        var invite = await _lobbyStateManager.GetInviteAsync(inviteId);
        if (invite is null) return;

        if (invite.InvitedUserId != userId) return;

        await _lobbyStateManager.DeleteInviteAsync(inviteId);
        await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);
    }
    
    public async Task GetPendingInvites()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var inviteIds = await _lobbyStateManager.GetUserInviteIdsAsync(userId);

        var invites = new List<object>();
        foreach (var inviteId in inviteIds)
        {
            var invite = await _lobbyStateManager.GetInviteAsync(inviteId);
            if (invite is not null)
            {
                invites.Add(new
                {
                    invite.InviteId,
                    invite.LobbyId,
                    invite.HostUsername,
                    invite.TableId,
                    invite.SentAt,
                });
            }
            else
            {
                await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);
            }
        }

        await Clients.Caller.SendAsync("PendingInvites", invites);
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