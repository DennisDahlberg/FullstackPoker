using System.Text.Json;
using Core.DTOs;
using Core.DTOs.Bot;
using Core.DTOs.Table;
using Core.GameModels;
using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Identity;
using HoldemPoker.Cards;
using HoldemPoker.Evaluator;

namespace Application.Services
{
    public class GameService : IGameService

    {
    private readonly BotAiService _botAiService;
    private readonly IGameHistoryService _gameHistoryService;
    private readonly UserManager<ApplicationUser> _userManager;
    private static readonly Random _random = new Random();

    public GameService(BotAiService botAiService, UserManager<ApplicationUser> userManager,
        IGameHistoryService gameHistoryService)
    {
        _botAiService = botAiService;
        _userManager = userManager;
        _gameHistoryService = gameHistoryService;
    }

    public GameState InitializeGame(List<UserDTO> players, TableDto table, List<BotDto> bots)
    {
        var allPlayers = new List<Player>();

        foreach (var userData in players)   
        {
            allPlayers.Add(new Player
            {
                Name = userData.Username,
                UserId = userData.Id,
                Chips = table.BuyIn,
                GameStartingChips = table.BuyIn,
                RoundStartingChips = table.BuyIn,
                IsPlayer = true,
                CurrentBet = 0,
                SeatNumber = allPlayers.Count,
                ProfileImageUrl = userData.ProfileImageUrl,
            });
        }

        foreach (var bot in bots)
        {
            allPlayers.Add(new Player
            {
                Name = bot.Username,
                UserId = null,
                Chips = table.BuyIn,
                IsPlayer = false,
                ProfileImageUrl = bot.ProfileImageUrl,
                PlayStyle = bot.PlayStyle,
                SkillLevel = bot.SkillLevel,
                Description = bot.Description,
                SeatNumber = allPlayers.Count,
                RoundStartingChips = table.BuyIn,
            });
        }

        var gameState = new GameState
        {
            Players = allPlayers,
            StartedAt = DateTimeOffset.UtcNow,
            TableId = table.Id
        };

        SetupBlinds(gameState, table);

        gameState.Deck = InitializeDeck();
        foreach (var player in gameState.Players)
            GetStartingHand(player, gameState.Deck);
        GetCommunityCards(gameState);
        gameState.AvailableActions = GetAvailableActions(gameState);
        CalculateLeavePenalty(gameState);

        return gameState;
    }

    public GameState NewRound(GameState gameState)
    {
        gameState.Players.RemoveAll(p => !p.IsPlayer && p.Chips <= 0);
        if (gameState.Players.Count > 0)
            gameState.DealerPosition = gameState.DealerPosition % gameState.Players.Count;
        
        gameState.Deck = InitializeDeck();
        gameState.CommunityCards.Clear();
        GetCommunityCards(gameState);
        gameState.HighestBet = 0;
        gameState.CurrentPlayerIndex = (gameState.BigBlindPosition + 1) % gameState.Players.Count;
        gameState.IsGameOver = false;
        gameState.WinnersPositions.Clear();
        foreach (var player in gameState.Players)
        {
            player.Hand.Clear();
            player.CurrentBet = 0;
            player.IsFolded = false;
            player.IsActive = true;
            player.IsDealer = false;
            player.HasActedThisRound = false;
            player.LastAction = null;
            player.LastActionAmount = null;
            player.Comment = null;
            GetStartingHand(player, gameState.Deck);
            player.RoundStartingChips = player.Chips;
        }

        gameState.Pot = 0;
        gameState.Stage = GameStage.PreFlop;
        gameState.DealerPosition = (gameState.DealerPosition + 1) % gameState.Players.Count;
        gameState.Players[gameState.DealerPosition].IsDealer = true;
        gameState.SmallBlindPosition = (gameState.DealerPosition + 1) % gameState.Players.Count;
        gameState.BigBlindPosition = (gameState.DealerPosition + 2) % gameState.Players.Count;
        gameState.CurrentPlayerIndex = (gameState.BigBlindPosition + 1) % gameState.Players.Count;
        gameState.AvailableActions = GetAvailableActions(gameState);

        var smallBlindPlayer = gameState.Players[gameState.SmallBlindPosition];
        var bigBlindPlayer = gameState.Players[gameState.BigBlindPosition];
        smallBlindPlayer.LastAction = "small";
        bigBlindPlayer.LastAction = "big";

        var smallBlindAmount = Math.Min(gameState.SmallBlind, smallBlindPlayer.Chips);
        smallBlindPlayer.Chips -= smallBlindAmount;
        smallBlindPlayer.CurrentBet = smallBlindAmount;
        gameState.Pot += smallBlindAmount;

        var bigBlindAmount = Math.Min(gameState.BigBlind, bigBlindPlayer.Chips);
        bigBlindPlayer.Chips -= bigBlindAmount;
        bigBlindPlayer.CurrentBet = bigBlindAmount;
        gameState.Pot += bigBlindAmount;
        gameState.HighestBet = bigBlindAmount;

        return gameState;
    }

    public void SetupBlinds(GameState state, TableDto table)
    {
        var playerCount = state.Players.Count;
        state.SmallBlind = table.SmallBlind;
        state.BigBlind = table.BigBlind;

        if (state.IsFirstRound)
            state.DealerPosition = _random.Next(0, playerCount);
        else
            state.DealerPosition = (state.DealerPosition + 1) % playerCount;

        if (playerCount <= 2)
        {
            state.SmallBlindPosition = state.DealerPosition;
            state.CurrentPlayerIndex = state.DealerPosition;
        }
        else
        {
            state.SmallBlindPosition = (state.DealerPosition + 1) % playerCount;
            state.CurrentPlayerIndex = (state.SmallBlindPosition + 2) % playerCount;
        }

        state.BigBlindPosition = (state.SmallBlindPosition + 1) % playerCount;

        foreach (var player in state.Players)
        {
            player.IsDealer = false;
        }

        var smallBlindPlayer = state.Players[state.SmallBlindPosition];
        var bigBlindPlayer = state.Players[state.BigBlindPosition];
        smallBlindPlayer.LastAction = "small";
        bigBlindPlayer.LastAction = "big";

        state.Players[state.DealerPosition].IsDealer = true;

        var smallBlindAmount = Math.Min(state.SmallBlind, smallBlindPlayer.Chips);
        smallBlindPlayer.Chips -= smallBlindAmount;
        smallBlindPlayer.CurrentBet = smallBlindAmount;
        state.Pot += smallBlindAmount;

        var bigBlindAmount = Math.Min(state.BigBlind, bigBlindPlayer.Chips);
        bigBlindPlayer.Chips -= bigBlindAmount;
        bigBlindPlayer.CurrentBet = bigBlindAmount;
        state.Pot += bigBlindAmount;
        state.HighestBet = bigBlindAmount;
        state.IsFirstRound = false;
    }

    public void GetStartingHand(Player player, List<PlayerCard> deck)
    {
        player.Hand.Add(DrawCard(deck));
        player.Hand.Add(DrawCard(deck));
        if (player.IsPlayer is true)
        {
            player.Hand[0].IsHidden = false;
            player.Hand[1].IsHidden = false;
        }
    }

    public void GetCommunityCards(GameState state)
    {
        state.CommunityCards.Add(DrawCard(state.Deck));
        state.CommunityCards.Add(DrawCard(state.Deck));
        state.CommunityCards.Add(DrawCard(state.Deck));
        state.CommunityCards.Add(DrawCard(state.Deck));
        state.CommunityCards.Add(DrawCard(state.Deck));
    }

    public List<PlayerCard> InitializeDeck()
    {
        var cards = new List<PlayerCard>();

        var ranks = new List<string> { "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" };
        var suits = new List<string> { "H", "D", "S", "C" };

        foreach (var rank in ranks)
        {
            foreach (var suit in suits)
            {
                cards.Add(new PlayerCard { Rank = rank, Suit = suit, IsHidden = true });
            }
        }

        return cards;
    }

    public PlayerCard DrawCard(List<PlayerCard> deck)
    {
        var index = _random.Next(deck.Count);
        var card = deck[index];
        deck.RemoveAt(index);
        return card;
    }

    public List<string> GetAvailableActions(GameState state)
    {
        var actions = new List<string>();

        var player = state.Players[state.CurrentPlayerIndex];

        // Only show actions for human players on their turn
        if (!player.IsPlayer)
            return actions;

        if (player.IsActive == false)
            return actions;

        var callAmount = state.HighestBet - player.CurrentBet;

        if (callAmount == 0)
            actions.Add("check");
        else if (player.Chips >= callAmount)
            actions.Add("call");
        if (player.Chips >= callAmount && player.HasActedThisRound == false)
            actions.Add("raise");
        if (callAmount > player.Chips)
            actions.Add("all-in");

        actions.Add("fold");

        return actions;
    }

    public async Task HandlePlayerAction(PlayerActionRequest actionRequest, GameState state)
    {
        var currentPlayer = state.Players[state.CurrentPlayerIndex];
        switch (actionRequest.Action)
        {
            case "fold":
                currentPlayer.IsFolded = true;
                currentPlayer.IsActive = false;
                currentPlayer.LastAction = "fold";
                break;
            case "call":
                var callAmount = state.HighestBet - currentPlayer.CurrentBet;
                var actualCallAmount = Math.Min(callAmount, currentPlayer.Chips);
                currentPlayer.CurrentBet += callAmount;
                currentPlayer.Chips -= callAmount;
                state.Pot += actualCallAmount;
                if (actualCallAmount >= currentPlayer.Chips)
                {
                    currentPlayer.IsActive = false;
                }

                if (actualCallAmount == 0)
                {
                    currentPlayer.LastAction = "check";
                    break;
                }

                currentPlayer.LastAction = "call";
                currentPlayer.LastActionAmount = actualCallAmount;
                break;
            case "check":
                currentPlayer.LastAction = "check";
                break;
            case "raise":
                var safeRaiseAmount =
                    Math.Min(actionRequest.Amount + (state.HighestBet - currentPlayer.CurrentBet) ?? 0,
                        currentPlayer.Chips);
                currentPlayer.Chips -= safeRaiseAmount;
                currentPlayer.CurrentBet += safeRaiseAmount;
                state.Pot += safeRaiseAmount;
                state.HighestBet = currentPlayer.CurrentBet;
                if (currentPlayer.Chips <= 0)
                    currentPlayer.IsActive = false;
                foreach (var player in state.Players.Where(p => p.IsActive == true))
                    player.HasActedThisRound = false;
                currentPlayer.HasActedThisRound = true;
                currentPlayer.LastAction = "raise";
                currentPlayer.LastActionAmount = safeRaiseAmount;
                break;
            case "all-in":
                currentPlayer.CurrentBet += currentPlayer.Chips;
                state.Pot +=  currentPlayer.Chips;
                currentPlayer.Chips = 0;
                currentPlayer.LastAction = "allin";
                currentPlayer.IsActive = false;
                break;
        }

        currentPlayer.HasActedThisRound = true;
        if (!string.IsNullOrEmpty(actionRequest.Comment))
            currentPlayer.Comment = actionRequest.Comment;

        if (state.Players.Count(p => !p.IsFolded) == 1)
        {
            await HandleEndOfRound(state);
            state.AvailableActions = GetAvailableActions(state);
            return;
        }

        if (state.Players.Where(p => p.IsActive == true).All(p => p.HasActedThisRound == true))
        {
            await HandleEndOfStage(state);
            state.AvailableActions = GetAvailableActions(state);
            return;
        }

        HandleNextPlayer(state);

        state.AvailableActions = GetAvailableActions(state);
        CalculateLeavePenalty(state);
    }

    public void HandleNextPlayer(GameState state)
    {
        do
        {
            state.CurrentPlayerIndex++;
            if (state.CurrentPlayerIndex >= state.Players.Count)
                state.CurrentPlayerIndex = 0;
            if (state.Players[state.CurrentPlayerIndex].IsActive == false)
                state.Players[state.CurrentPlayerIndex].HasActedThisRound = true;
        } while (state.Players[state.CurrentPlayerIndex].IsActive == false);
    }

    public async Task HandleBotAction(GameState gameState)
    {
        var botActionJson = await _botAiService.GetBotAction(gameState);

        try
        {
            botActionJson = botActionJson.Trim();
            if (botActionJson.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
                botActionJson = botActionJson.Substring(7);
            else if (botActionJson.StartsWith("```"))
                botActionJson = botActionJson.Substring(3);

            if (botActionJson.EndsWith("```"))
                botActionJson = botActionJson.Substring(0, botActionJson.Length - 3);

            botActionJson = botActionJson.Trim();

            var botAction = JsonSerializer.Deserialize<BotAction>(botActionJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            var actionRequest = new PlayerActionRequest
            {
                Action = botAction.Action,
                Amount = botAction.Amount,
                Comment = botAction.Comment,
            };
        
            await HandlePlayerAction(actionRequest, gameState);
        }
        catch (Exception err)
        {
            await HandlePlayerAction(new PlayerActionRequest { Action = "call" }, gameState);
        }
    }

    public async Task HandleEndOfStage(GameState state)
    {
        switch (state.Stage)
        {
            case GameStage.PreFlop:
                state.Stage = GameStage.Flop;
                state.CommunityCards[0].IsHidden = false;
                state.CommunityCards[1].IsHidden = false;
                state.CommunityCards[2].IsHidden = false;
                break;
            case GameStage.Flop:
                state.Stage = GameStage.Turn;
                state.CommunityCards[3].IsHidden = false;
                break;
            case GameStage.Turn:
                state.Stage = GameStage.River;
                state.CommunityCards[4].IsHidden = false;
                break;
            case GameStage.River:
                state.Stage = GameStage.Showdown;
                await HandleEndOfRound(state);
                break;
        }

        foreach (var player in state.Players)
        {
            player.HasActedThisRound = false;
            player.LastAction = null;
            player.LastActionAmount = null;
            
            if (!state.IsGameOver)
                player.Comment = null;
        }

        state.CurrentPlayerIndex = state.DealerPosition;
        HandleNextPlayer(state);
    }

    public async Task HandleEndOfRound(GameState state)
    {
        var activePlayers = state.Players
            .Where(p => !p.IsFolded)
            .OrderBy(p => p.CurrentBet)
            .ToList();
        
        var board = state.CommunityCards
            .Select(ConvertToHoldemPokerCard)
            .ToArray();

        var rankings = activePlayers.ToDictionary(
            p => p,
            p => HoldemHandEvaluator.GetHandRanking(
                p.Hand.Select(ConvertToHoldemPokerCard).Concat(board).ToArray())
            );

        foreach (var player in activePlayers)
        {
            player.Hand[0].IsHidden = false;
            player.Hand[1].IsHidden = false;
        }
        
        int alreadyDistributed = 0;

        foreach (var pivotPLayer in activePlayers)
        {
            int cap = pivotPLayer.CurrentBet;

            int potAmount = state.Players.Sum(p => Math.Min(p.CurrentBet, cap));
            potAmount -= alreadyDistributed;
            alreadyDistributed += potAmount;
            
            if (potAmount <= 0) continue;

            var eligible = activePlayers.Where(p => p.CurrentBet >= cap).ToList();
            
            var bestRanking = eligible.Min(p => rankings[p]);
            var winners = eligible.Where(p => rankings[p] == bestRanking).ToList();

            int winAmount = potAmount / winners.Count;
            int remainder = potAmount % winners.Count;
            
            foreach (var winner in winners)
            {
                winner.Chips += winAmount;
                var idx = state.Players.IndexOf(winner);
                if (!state.WinnersPositions.Contains(idx))
                    state.WinnersPositions.Add(idx);
            }

            if (remainder > 0)
                winners[0].Chips += remainder; 
        }

        foreach (var player in state.Players)
        {
            player.BestHand = HoldemHandEvaluator
                .GetHandCategory(
                    player.Hand.Select(ConvertToHoldemPokerCard).Concat(board).ToArray())
                .ToString();

            if (player.Chips <= 0)
                player.IsAwaitingRebuy = true;
        }
        
        state.IsGameOver = true;
        state.PenaltyAmount = 0;
        state.RoundsPlayed++;

        await _gameHistoryService.SaveGameAsync(state);
    }

    public Card ConvertToHoldemPokerCard(PlayerCard card)
    {
        string rank = card.Rank == "10" ? "T" : card.Rank;
        string suit = card.Suit.ToLower();
        return Card.Parse($"{rank}{suit}");
    }

    public void CalculateLeavePenalty(GameState state)
    {
        var currentPlayer = state.Players.ElementAtOrDefault(state.CurrentPlayerIndex);
        if (currentPlayer != null && currentPlayer.IsPlayer)
        {
            state.PenaltyAmount = (int)(currentPlayer.Chips * 0.1);
            state.EarlyLeavePayout = currentPlayer.Chips - state.PenaltyAmount;
        }
    }
    }
}