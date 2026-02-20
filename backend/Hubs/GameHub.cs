using Core.GameModels;
using Core.Interfaces;
using HoldemPoker.Cards;
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
    
    private async Task BroadcastGameState(string gameId, GameState gameState)
    {
        var humanPlayers = gameState.Players.Where(p => p.IsPlayer && p.UserId != null).ToList();

        foreach (var player in humanPlayers)
        {
            var personalizedState = CreatePersonalizedGameState(gameState, player.UserId!);
            await Clients.User(player.UserId!).SendAsync("GameStateUpdated", personalizedState);
        }
    }

    private GameState CreatePersonalizedGameState(GameState gameState, string viewerUserId)
    {
        var personalizedPlayers = gameState.Players.Select(p =>
        {
            var clonedPlayer = new Player
            {
                Name = p.Name,
                UserId = p.UserId,
                Chips = p.Chips,
                IsPlayer = p.IsPlayer,
                CurrentBet = p.CurrentBet,
                IsFolded = p.IsFolded,
                HasActedThisRound = p.HasActedThisRound,
                IsActive = p.IsActive,
                ProfileImageUrl = p.ProfileImageUrl,
                PlayStyle = p.PlayStyle,
                SkillLevel = p.SkillLevel,
                SeatNumber = p.SeatNumber,
                Hand = p.Hand,
            };

            bool isMe = p.UserId == viewerUserId;
            bool isShowdown = gameState.IsGameOver;
            
            if (!isMe && !isShowdown)
            {
                clonedPlayer.Hand = p.Hand.Select(c => new PlayerCard()
                {
                    Rank = c.Rank,
                    Suit = c.Suit,
                    IsHidden = true
                }).ToList();
            }

            return clonedPlayer;
        }).ToList();

        return new GameState
        {
            GameId = gameState.GameId,
            Players = personalizedPlayers,
            CommunityCards = gameState.CommunityCards,
            Pot = gameState.Pot,
            CurrentPlayerIndex = gameState.CurrentPlayerIndex,
            SmallBlind = gameState.SmallBlind,
            BigBlind = gameState.BigBlind,
            IsGameOver = gameState.IsGameOver,
            HighestBet = gameState.HighestBet,
            AvailableActions = gameState.AvailableActions,
            WinnersPositions = gameState.WinnersPositions,
            PenaltyAmount = gameState.PenaltyAmount,
            EarlyLeavePayout = gameState.EarlyLeavePayout,
            CurrentViewerUserId = viewerUserId,
        };
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
        
        var personalizedState = CreatePersonalizedGameState(gameState, userId);
        await Clients.Caller.SendAsync("GameStateUpdated", personalizedState);

        var user = await _userService.GetUserById(userId);
        if (user is not null)
        {
            await Clients.OthersInGroup($"game_{gameId}").SendAsync("PlayerConnected", user.UserName);
        }
        
        await ProcessBotTurns(gameId, gameState);
    }

    public async Task PlayerAction(string action, int? amount)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            await Clients.Caller.SendAsync("Error", "No active game found");
            return;
        }

        var gameState = await _gameStateManager.GetGameStateAsync(gameId);
        if (gameState == null)
        {
            await Clients.Caller.SendAsync("Error", "Game not found");
            return;
        }

        var currentPlayer = gameState.Players[gameState.CurrentPlayerIndex];
        if (currentPlayer.UserId != userId)
        {
            await Clients.Caller.SendAsync("Error", "Not your turn");
            return;
        }

        try
        {
            var request = new PlayerActionRequest
            {
                Action = action,
                Amount = amount ?? 0,
            };

            await _gameService.HandlePlayerAction(request, gameState);
            await _gameStateManager.SaveGameStateAsync(gameId, gameState);
            await Clients.Group($"game_{gameId}").SendAsync("GameStateUpdated", gameState);
            
            await BroadcastGameState(gameId, gameState);
            await ProcessBotTurns(gameId, gameState);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    private async Task ProcessBotTurns(string gameId, GameState gameState)
    {
        while (!gameState.IsGameOver &&
               !gameState.Players[gameState.CurrentPlayerIndex].IsPlayer)
        {
            await _gameService.HandleBotAction(gameState);
            await _gameStateManager.SaveGameStateAsync(gameId, gameState);
            await BroadcastGameState(gameId, gameState);
        }
    }

    public async Task StartNewRound()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            await Clients.Caller.SendAsync("Error", "No active game found");
            return;
        }

        var gameState = await _gameStateManager.GetGameStateAsync(gameId);
        if (gameState == null)
        {
            await Clients.Caller.SendAsync("Error", "Game not found");
            return;
        }

        try
        {
            var newGameState = _gameService.NewRound(gameState);
            await _gameStateManager.SaveGameStateAsync(gameId, newGameState);
            await Clients.Group($"game_{gameId}").SendAsync("GameStateUpdated", newGameState);
            
            await BroadcastGameState(gameId, newGameState);
            await ProcessBotTurns(gameId, newGameState);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public async Task LeaveGame()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
            return;

        var gameState = await _gameStateManager.GetGameStateAsync(gameId);
        if (gameState == null)
            return;

        try
        {
            bool isEarlyLeave = !gameState.IsGameOver;

            await _gameHistoryService.UpdatePlayerBalanceFromGame(gameState);
            await _gameStateManager.DeleteGameStateAsync(gameId);
            await _gameStateManager.DeleteUserCurrentGameAsync(userId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game_{gameId}");

            await Clients.Caller.SendAsync("GameLeft", new
            {
                message = "Successfully left game",
                balanceReturned = isEarlyLeave
                    ? gameState.EarlyLeavePayout
                    : gameState.Players.First(p => p.IsPlayer).Chips
            });

            var user = await _userService.GetUserById(userId);
            if (user != null)
            {
                await Clients.OthersInGroup($"game_{gameId}")
                    .SendAsync("PlayerDisconnected", user.UserName);
            }
            await BroadcastGameState(gameId, gameState);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        if (!string.IsNullOrEmpty(userId))
        {
            var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
            if (gameId != null)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game_{gameId}");
                
                var user = await _userService.GetUserById(userId);
                if (user != null)
                {
                    await Clients.OthersInGroup($"game_{gameId}")
                        .SendAsync("PlayerDisconnected", user.UserName);
                }
            }
        }
        
        await base.OnDisconnectedAsync(exception);
    }
}