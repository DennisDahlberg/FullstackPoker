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
    public class GameService
    {
        private readonly BotAiService _botAiService;
        private readonly IGameHistoryService _gameHistoryService;
        private readonly UserManager<ApplicationUser> _userManager;
        private static readonly Random _random = new Random();

        public GameService(BotAiService botAiService, UserManager<ApplicationUser> userManager, IGameHistoryService gameHistoryService)
        {
            _botAiService = botAiService;
            _userManager = userManager;
            _gameHistoryService = gameHistoryService;
        }

        public GameState InitializeGame(UserDTO playerInfo, TableDto table, List<BotDto> bots)
        {
            var gameState = new GameState();

            gameState.Players.Add(new Player { Name = playerInfo.Username, Chips = table.BuyIn, IsPlayer = true, UserId = playerInfo.Id});
            foreach (var bot in bots)  
            {
                gameState.Players.Add(new Player { Name = bot.Username, Chips = table.BuyIn, IsPlayer = false });
            }
            
            gameState.TableId =  table.Id;
            gameState.StartedAt = DateTimeOffset.UtcNow;

            SetupBlinds(gameState, table);

            gameState.Deck = InitializeDeck();
            foreach (var player in gameState.Players)
                GetStartingHand(player, gameState.Deck);
            GetCommunityCards(gameState);
            gameState.AvailableActions = GetAvailableActions(gameState);

            return gameState;
        }

        public GameState NewRound(GameState gameState)
        {
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
                GetStartingHand(player, gameState.Deck);
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
                state.DealerPosition = (state.DealerPosition + 1)  % playerCount;

            if (playerCount <= 2)
            {
                state.SmallBlindPosition = state.DealerPosition;
                state.CurrentPlayerIndex = state.DealerPosition;
            }
            else
            {
                state.SmallBlindPosition = (state.DealerPosition + 1)  % playerCount;
                state.CurrentPlayerIndex = (state.SmallBlindPosition + 2)  % playerCount;
            }
            
            state.BigBlindPosition = (state.SmallBlindPosition + 1)  % playerCount;
            
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

        private PlayerCard DrawCard(List<PlayerCard> deck)
        {
            var index = _random.Next(deck.Count);
            var card = deck[index];
            deck.RemoveAt(index);
            return card;
        }

        private List<string> GetAvailableActions(GameState state)
        {
            var actions = new List<string>();

            var currentBet = state.Players.Max(p => p.CurrentBet);
            var player = state.Players.First(p => p.IsPlayer == true);
            var playerBet = player.CurrentBet;
            var callAmount = currentBet - playerBet;

            if (player.IsActive == false)
                return actions;

            if (state.Players[state.CurrentPlayerIndex].IsPlayer == false)
                return actions;

            if (callAmount == 0)
                actions.Add("check");
            else if (player.Chips >= callAmount)
                actions.Add("call");
            if (player.Chips >= callAmount && player.HasActedThisRound == false)
                actions.Add("raise");

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
                    if (actualCallAmount < callAmount)
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
                    var safeRaiseAmount = Math.Min(actionRequest.Amount + (state.HighestBet - currentPlayer.CurrentBet) ?? 0, currentPlayer.Chips);
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
            }

            currentPlayer.HasActedThisRound = true;

            if (state.Players.Count(p => p.IsActive) == 1)
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
            } 
            while (state.Players[state.CurrentPlayerIndex].IsActive == false);
        }

        public async Task HandleBotAction(GameState gameState)
        {
            var botActionJson = await _botAiService.GetBotAction(gameState);

            var botAction = JsonSerializer.Deserialize<BotAction>(botActionJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (botAction is null)
            {
                await HandlePlayerAction(new PlayerActionRequest { Action = "call" }, gameState);
                return;
            }

            var actionRequest = new PlayerActionRequest
            {
                Action = botAction.Action,
                Amount = botAction.Amount
            };           

            await HandlePlayerAction(actionRequest, gameState);
        }

        private async Task HandleEndOfStage(GameState state)
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
            }

            state.CurrentPlayerIndex = state.DealerPosition;
            HandleNextPlayer(state);
        }

        private async Task HandleEndOfRound(GameState state)
        {
            var activePlayers = state.Players
                .Where(p => p.IsFolded == false)
                .ToList();         

            var board = state.CommunityCards
                .Select(ConvertToHoldemPokerCard)
                .ToArray();

            var results = activePlayers.Select(p => new
            {
                Player = p,
                Ranking = HoldemHandEvaluator.GetHandRanking(
                    p.Hand.Select(ConvertToHoldemPokerCard).Concat(board).ToArray()
                )
            }).ToList();

            var bestRanking = results.Min(r => r.Ranking);
            var winners = results.Where(r => r.Ranking == bestRanking).ToList();

            int winAmount = state.Pot / winners.Count;
            foreach (var player in activePlayers)
            {
                player.Hand[0].IsHidden = false;
                player.Hand[1].IsHidden = false;
            }
            foreach (var winner in winners)
            {
                winner.Player.Chips += winAmount;
                state.WinnersPositions.Add(state.Players.IndexOf(winner.Player));
            }
            state.IsGameOver = true;
            
            await _gameHistoryService.SaveGameAsync(state);
        }

        private Card ConvertToHoldemPokerCard(PlayerCard card)
        {
            string rank = card.Rank == "10" ? "T" : card.Rank;
            string suit = card.Suit.ToLower();
            return Card.Parse($"{rank}{suit}");
        }
    }
}