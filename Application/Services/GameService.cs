using System.Text.Json;
using Core.DTOs;
using Core.GameModels;
using Core.Models;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class GameService
    {
        private readonly BotAiService _botAiService;
        private readonly UserManager<ApplicationUser> _userManager;
        private static readonly Random _random = new Random();

        public GameService(BotAiService botAiService, UserManager<ApplicationUser> userManager)
        {
            _botAiService = botAiService;
            _userManager = userManager;
        }

        public GameState InitializeGame(PlayerInfoDTO playerInfo)
        {
            var gameState = new GameState();

            gameState.Players.Add(new Player { Name = playerInfo.Name, Chips = 1000, IsPlayer = true });
            gameState.Players.Add(new Player { Name = "Albert", Chips = 1000 });
            gameState.Players.Add(new Player { Name = "Otto", Chips = 1000 });
            gameState.Players.Add(new Player { Name = "Corre", Chips = 1000 });
            gameState.Players.Add(new Player { Name = "Calle", Chips = 1000 });
            gameState.Players.Add(new Player { Name = "Lotta", Chips = 1000 });

            SetupBlinds(gameState);

            gameState.Deck = InitializeDeck();
            foreach (var player in gameState.Players)
                GetStartingHand(player, gameState.Deck);
            GetCommunityCards(gameState);
            gameState.AvailableActions = GetAvailableActions(gameState);

            return gameState;
        }

        public void SetupBlinds(GameState state)
        {
            var playerCount = state.Players.Count;

            foreach (var player in state.Players)
            {
                player.IsDealer = false;
            }

            var smallBlindPlayer = state.Players[state.SmallBlindPosition];
            var bigBlindPlayer = state.Players[state.BigBlindPosition];

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
        }

        public void GetStartingHand(Player player, List<Card> deck)
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

        public List<Card> InitializeDeck()
        {
            var cards = new List<Card>();

            var ranks = new List<string> { "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" };
            var suits = new List<string> { "H", "D", "S", "C" };

            foreach (var rank in ranks)
            {
                foreach (var suit in suits)
                {
                    cards.Add(new Card { Rank = rank, Suit = suit, IsHidden = true });
                }
            }
            return cards;
        }

        public Card DrawCard(List<Card> deck)
        {
            var index = _random.Next(deck.Count);
            var card = deck[index];
            deck.RemoveAt(index);
            return card;
        }

        public List<string> GetAvailableActions(GameState state)
        {
            var actions = new List<string>();

            var currentBet = state.Players.Max(p => p.CurrentBet);
            var player = state.Players.First(p => p.IsPlayer == true);
            var playerBet = player.CurrentBet;
            var callAmount = currentBet - playerBet;

            if (callAmount == 0)
                actions.Add("check");
            else if (player.Chips >= callAmount)
                actions.Add("call");
            if (player.Chips >= callAmount && player.HasActedThisRound == false)
                actions.Add("raise");

            actions.Add("fold");

            return actions;
        }

        public void HandlePlayerAction(PlayerActionRequest actionRequest, GameState state)
        {
            var currentPlayer = state.Players[state.CurrentPlayerIndex];
            switch (actionRequest.Action)
            {
                case "fold":
                    currentPlayer.IsFolded = true;
                    currentPlayer.IsActive = false;
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
                    break;
                case "check":
                    break;
                case "raise":
                    var safeRaiseAmount = Math.Min(actionRequest.Amount ?? 0, currentPlayer.Chips);
                    currentPlayer.Chips -= safeRaiseAmount;
                    currentPlayer.CurrentBet += safeRaiseAmount;
                    state.Pot += safeRaiseAmount;
                    state.HighestBet = currentPlayer.CurrentBet;
                    foreach (var player in state.Players)
                        player.HasActedThisRound = false;
                    break;
            }

            currentPlayer.HasActedThisRound = true;

            if (state.Players.All(p => p.HasActedThisRound == true))
            {
                HandleEndOfStage(state);
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
                HandlePlayerAction(new PlayerActionRequest { Action = "call" }, gameState);
                return;
            }

            var actionRequest = new PlayerActionRequest
            {
                Action = botAction.Action,
                Amount = botAction.Amount
            };

            Thread.Sleep(1500);

            HandlePlayerAction(actionRequest, gameState);
        }

        public void HandleEndOfStage(GameState state)
        {
            if (state.Players.Any(p => p.HasActedThisRound == false))
                return;

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
                    break;
            }

            foreach (var player in state.Players)
            {
                player.CurrentBet = 0;
                player.HasActedThisRound = false;
            }

            state.CurrentPlayerIndex = state.DealerPosition;
            HandleNextPlayer(state);
        }
    }
}