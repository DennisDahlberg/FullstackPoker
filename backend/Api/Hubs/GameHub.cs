using System.Collections.Concurrent;
using Core.GameModels;
using Core.Interfaces;
using HoldemPoker.Cards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

[Authorize]
public class GameHub : Hub
{
    private readonly IGameStateManager _gameStateManager;
    private readonly IUserService _userService;
    private readonly IGameHistoryService _gameHistoryService;
    private readonly IGameService _gameService;
    private readonly ILogger<GameHub> _logger;

    private static readonly ConcurrentDictionary<string, SemaphoreSlim> _gameLocks = new();

    public GameHub(IGameStateManager gameStateManager, IUserService userService, IGameHistoryService gameHistoryService, IGameService gameService, ILogger<GameHub> logger)
    {
        _gameStateManager = gameStateManager;
        _userService = userService;
        _gameHistoryService = gameHistoryService;
        _gameService = gameService;
        _logger = logger;
    }

    private SemaphoreSlim GetGameLock(string gameId)
    {
        return _gameLocks.GetOrAdd(gameId, _ => new SemaphoreSlim(1, 1));
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
                IsDealer = p.IsDealer,
                LastAction = p.LastAction,
                LastActionAmount = p.LastActionAmount,
                Comment = p.Comment,
                IsAwaitingRebuy = p.IsAwaitingRebuy
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

        // Compute per-viewer available actions
        var viewerPlayer = gameState.Players.FirstOrDefault(p => p.UserId == viewerUserId);
        var viewerIndex = viewerPlayer != null ? gameState.Players.IndexOf(viewerPlayer) : -1;
        var isMyTurn = viewerIndex == gameState.CurrentPlayerIndex;

        var actions = new List<string>();
        if (isMyTurn && viewerPlayer != null && viewerPlayer.IsActive && !gameState.IsGameOver)
        {
            actions = gameState.AvailableActions;
        }

        // Compute per-viewer leave penalty
        int penaltyAmount = 0;
        int earlyLeavePayout = 0;
        if (viewerPlayer != null)
        {
            penaltyAmount = (int)(viewerPlayer.Chips * 0.1);
            earlyLeavePayout = viewerPlayer.Chips - penaltyAmount;
        }

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
            AvailableActions = actions,
            WinnersPositions = gameState.WinnersPositions,
            PenaltyAmount = penaltyAmount,
            EarlyLeavePayout = earlyLeavePayout,
            CurrentViewerUserId = viewerUserId,
        };
    }

    public async Task JoinGame()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        _logger.LogInformation("User {UserId} attempting to join game", userId);
        
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            _logger.LogWarning("Failed to join game for User {UserId}: No active game found", userId);
            await Clients.Caller.SendAsync("Error", "No active game found. Please start a new game from the lobby.");
            return;
        }

        var gameLock = GetGameLock(gameId);
        _logger.LogDebug("User {UserId} waiting for lock on game {GameId} to join", userId, gameId);
        await gameLock.WaitAsync();
        _logger.LogDebug("User {UserId} acquired lock on game {GameId} to join", userId, gameId);
        
        try
        {
            var gameState = await _gameStateManager.GetGameStateAsync(gameId);
            if (gameState is null)
            {
                _logger.LogError("Game state not found for game {GameId} during {UserId} join", gameId, userId);
                await Clients.Caller.SendAsync("Error", "Game state not found");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"game_{gameId}");

            var personalizedState = CreatePersonalizedGameState(gameState, userId);
            await Clients.Caller.SendAsync("GameStateUpdated", personalizedState);

            var user = await _userService.GetUserById(userId);
            if (user is not null)
            {
                _logger.LogInformation("User {UserName} successfully joined game {GameId}", user.UserName, gameId);
                await Clients.OthersInGroup($"game_{gameId}").SendAsync("PlayerConnected", user.UserName);
            }

            await ProcessBotTurns(gameId, gameState);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while user {UserId} was joining game {GameId}", userId, gameId);
            throw;
        }
        finally
        {
            gameLock.Release();
            _logger.LogDebug("User {UserId} released lock on game {GameId} after joining", userId, gameId);
        }
    }

    public async Task PlayerAction(string action, int? amount)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        _logger.LogInformation("User {UserId} performing PlayerAction: {Action} (Amount: {Amount})", userId, action, amount);
        
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            _logger.LogWarning("PlayerAction failed for User {UserId}: No active game found", userId);
            await Clients.Caller.SendAsync("Error", "No active game found");
            return;
        }

        var gameLock = GetGameLock(gameId);
        _logger.LogDebug("User {UserId} waiting for lock on game {GameId} for PlayerAction", userId, gameId);
        await gameLock.WaitAsync();
        _logger.LogDebug("User {UserId} acquired lock on game {GameId} for PlayerAction", userId, gameId);
        
        try
        {
            var gameState = await _gameStateManager.GetGameStateAsync(gameId);
            if (gameState == null)
            {
                _logger.LogWarning("PlayerAction failed for User {UserId} in game {GameId}: Game not found", userId, gameId);
                await Clients.Caller.SendAsync("Error", "Game not found");
                return;
            }

            var currentPlayer = gameState.Players[gameState.CurrentPlayerIndex];
            if (currentPlayer.UserId != userId)
            {
                _logger.LogWarning("PlayerAction out of turn for User {UserId} in game {GameId}. Expected User {ExpectedUserId}", userId, gameId, currentPlayer.UserId);
                await Clients.Caller.SendAsync("Error", "Not your turn");
                return;
            }

            var request = new PlayerActionRequest
            {
                Action = action,
                Amount = amount ?? 0,
            };

            await _gameService.HandlePlayerAction(request, gameState);
            await _gameStateManager.SaveGameStateAsync(gameId, gameState);
            
            _logger.LogInformation("User {UserId} completed PlayerAction {Action} successfully in game {GameId}", userId, action, gameId);
            
            await BroadcastGameState(gameId, gameState);
            await ProcessBotTurns(gameId, gameState);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing PlayerAction for User {UserId} in game {GameId}", userId, gameId);
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
        finally
        {
            gameLock.Release();
            _logger.LogDebug("User {UserId} released lock on game {GameId} after PlayerAction", userId, gameId);
        }
    }

    private async Task ProcessBotTurns(string gameId, GameState gameState)
    {
        while (!gameState.IsGameOver &&
               !gameState.Players[gameState.CurrentPlayerIndex].IsPlayer)
        {
            var botName = gameState.Players[gameState.CurrentPlayerIndex].Name;
            _logger.LogInformation("Processing bot turn for {BotName} at index {Index} in game {GameId}", botName, gameState.CurrentPlayerIndex, gameId);
            
            try 
            {
                await _gameService.HandleBotAction(gameState);
                await _gameStateManager.SaveGameStateAsync(gameId, gameState);
                
                _logger.LogInformation("Successfully completed bot turn for {BotName} in game {GameId}", botName, gameId);

                await BroadcastGameState(gameId, gameState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing bot turn for {BotName} in game {GameId}", botName, gameId);
                break;
            }
        }
    }

    public async Task SubmitRebuy(bool wantsToRebuy)
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            _logger.LogWarning("Rebuy failed for User {UserId}: No active game found", userId);
            await Clients.Caller.SendAsync("Error", "No active game found");
            return;
        }

        var gameLock = GetGameLock(gameId);
        _logger.LogDebug("User {UserId} waiting for lock on game {GameId} for Rebuy", userId, gameId);
        await gameLock.WaitAsync();
        _logger.LogDebug("User {UserId} acquired lock on game {GameId} for Rebuy", userId, gameId);

        try
        {
            var gameState = await _gameStateManager.GetGameStateAsync(gameId);
            if (gameState is null)
            {
                _logger.LogWarning("Rebuy failed for User {UserId}: No active game found", userId);
                await Clients.Caller.SendAsync("Error", "Game not found");
                return;
            }

            var player = gameState.Players.FirstOrDefault(p => p.UserId == userId);
            if (player is null || !player.IsAwaitingRebuy)
            {
                _logger.LogWarning("Rebuy failed for User {UserId}: No rebuy pending", userId);
                await Clients.Caller.SendAsync("Error", "No rebuy pending");
                return;
            }

            if (wantsToRebuy)
            {
                var buyInAmount = player.GameStartingChips;
                var balanceResult = await _userService.UpdateUserBalanceAsync(userId, -buyInAmount);
                if (!balanceResult.IsSuccess)
                {
                    await Clients.Caller.SendAsync("Error", "Insufficient balance to rebuy");
                    return;
                }
                else
                {
                    player.Chips = buyInAmount;
                    player.IsAwaitingRebuy = false;
                    player.IsActive = true;
                    player.IsFolded = false;

                    await Clients.Caller.SendAsync("PlayerRebuy", buyInAmount);
                    await _gameStateManager.SaveGameStateAsync(gameId, gameState);
                    await BroadcastGameState(gameId, gameState);
                    return;
                }
            }
            
            if (!wantsToRebuy)
            {
                var session = _gameHistoryService.GetGameSessionForPlayer(player, gameState);

                player.IsAwaitingRebuy = false;
                player.IsFolded = true;
                player.IsActive = false;
                var leavingUserId = player.UserId;

                await _gameStateManager.DeleteUserCurrentGameAsync(leavingUserId!);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game_{gameId}");
                await Clients.Caller.SendAsync("GameLeft", session);

                var remainingHumans = gameState.Players
                    .Where(p => p.IsPlayer && p.UserId != null)
                    .ToList();

                if (remainingHumans.Count == 0)
                {
                    await _gameStateManager.DeleteGameStateAsync(gameId);
                    _gameLocks.TryRemove(gameId, out _);
                }
                else
                {
                    await _gameStateManager.SaveGameStateAsync(gameId, gameState);

                    var user = await _userService.GetUserById(leavingUserId!);
                    if (user != null)
                        await Clients.Group($"game_{gameId}").SendAsync("PlayerDisconnected", user.UserName);

                    await BroadcastGameState(gameId, gameState);
                    await ProcessBotTurns(gameId, gameState);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Rebuy for User {UserId} in game {GameId}", userId, gameId);
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
        finally
        {
            gameLock.Release();
            _logger.LogDebug("User {UserId} released lock on game {GameId} after Rebuy", userId, gameId);
        }
        
    }

    public async Task SubmitReady()
    {
        var userId = _userService.GetLoggedInUserId(Context.User!);
        
        var gameId = await _gameStateManager.GetUserCurrentGameAsync(userId);
        if (gameId is null)
        {
            _logger.LogWarning("Rebuy failed for User {UserId}: No active game found", userId);
            await Clients.Caller.SendAsync("Error", "No active game found");
            return;
        }

        var gameLock = GetGameLock(gameId);
        _logger.LogDebug("User {UserId} waiting for lock on game {GameId} for Submit", userId, gameId);
        await gameLock.WaitAsync();
        _logger.LogDebug("User {UserId} acquired lock on game {GameId} for Rebuy", userId, gameId);
        try
        {
            var gameState = await _gameStateManager.GetGameStateAsync(gameId);
            if (gameState is null || !gameState.IsGameOver) return;
            
            if (!gameState.ReadyPlayerIds.Contains(userId))
                gameState.ReadyPlayerIds.Add(userId);

            var humanPlayers = gameState.Players
                .Where(p => p.IsPlayer && p.UserId != null)
                .ToList();
            var allReady = humanPlayers
                .All(p => gameState.ReadyPlayerIds.Contains(p.UserId!));

            if (allReady)
            {
                gameState.ReadyPlayerIds.Clear();
                var newGameState = _gameService.NewRound(gameState);
                await _gameStateManager.SaveGameStateAsync(gameId, newGameState);
                await BroadcastGameState(gameId, newGameState);
                await ProcessBotTurns(gameId, newGameState);
            }
            else
            {
                await _gameStateManager.SaveGameStateAsync(gameId, gameState);
                await BroadcastGameState(gameId, gameState);
            }
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
            _logger.LogError(ex, "Error processing Ready up for User {UserId} in game {GameId}", userId, gameId);
        }
        finally
        {
            gameLock.Release();
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

        var gameLock = GetGameLock(gameId);
        await gameLock.WaitAsync();
        try
        {
            var gameState = await _gameStateManager.GetGameStateAsync(gameId);
            if (gameState == null)
                return;

            var leavingPlayer = gameState.Players.FirstOrDefault(p => p.UserId == userId);
            if (leavingPlayer == null) return;

            bool isEarlyLeave = !gameState.IsGameOver;
            int payout = isEarlyLeave
                ? (int)(leavingPlayer.Chips * 0.9)
                : leavingPlayer.Chips;
            
            var session = _gameHistoryService.GetGameSessionForPlayer(leavingPlayer, gameState);

            leavingPlayer.IsFolded = true;
            leavingPlayer.IsActive = false;
            leavingPlayer.Chips = 0;
            var leavingUserId = leavingPlayer.UserId;
            leavingPlayer.UserId = null;

            if (gameState.CurrentPlayerIndex >= 0 && 
                gameState.CurrentPlayerIndex < gameState.Players.Count &&
                gameState.Players[gameState.CurrentPlayerIndex] == leavingPlayer)
            {
                var activePlayers = gameState.Players.Where(p => p.IsActive).ToList();
                if (activePlayers.Count <= 1)
                {
                    leavingPlayer.IsFolded = true;
                    leavingPlayer.IsActive = false;
                    leavingPlayer.LastAction = "fold";
                    leavingPlayer.HasActedThisRound = true;
                }
                else
                {
                    _gameService.HandleNextPlayer(gameState);
                }
            }

            await _userService.UpdateUserBalanceAsync(leavingUserId!, payout);
            await _gameStateManager.DeleteUserCurrentGameAsync(leavingUserId!);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game_{gameId}");

            await Clients.Caller.SendAsync("GameLeft", session);

            var remainingHumans = gameState.Players
                .Where(p => p.IsPlayer && p.UserId != null)
                .ToList();

            if (remainingHumans.Count == 0)
            {
                await _gameStateManager.DeleteGameStateAsync(gameId);
                _gameLocks.TryRemove(gameId, out _);
            }
            else
            {
                if (gameState.IsGameOver &&
                    remainingHumans.All(p => gameState.ReadyPlayerIds.Contains(p.UserId!)))
                {
                    gameState.ReadyPlayerIds.Clear();
                    var newGameState = _gameService.NewRound(gameState);
                    await _gameStateManager.SaveGameStateAsync(gameId, newGameState);
                    await BroadcastGameState(gameId, newGameState);
                    await ProcessBotTurns(gameId, newGameState);
                }
                else
                {
                    await _gameStateManager.SaveGameStateAsync(gameId, gameState);
                    await BroadcastGameState(gameId, gameState);
                    await ProcessBotTurns(gameId, gameState);
                }
                
                var user = await _userService.GetUserById(leavingUserId!);
                if (user != null)
                {
                    await Clients.Group($"game_{gameId}")
                        .SendAsync("PlayerDisconnected", user.UserName);
                }
            }
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
        finally
        {
            gameLock.Release();
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