using Core.DTOs;
using Core.DTOs.Bot;
using Core.DTOs.Table;
using Core.GameModels;
using HoldemPoker.Cards;

namespace Core.Interfaces;

public interface IGameService
{
    GameState InitializeGame(UserDTO playerInfo, TableDto table, List<BotDto> bots);
    GameState NewRound(GameState gameState);
    void SetupBlinds(GameState state, TableDto table);
    void GetStartingHand(Player player, List<PlayerCard> deck);
    void GetCommunityCards(GameState state);
    List<PlayerCard> InitializeDeck();
    PlayerCard DrawCard(List<PlayerCard> deck);
    List<string> GetAvailableActions(GameState state);
    Task HandlePlayerAction(PlayerActionRequest actionRequest, GameState state);
    void HandleNextPlayer(GameState state);
    Task HandleBotAction(GameState gameState);
    Task HandleEndOfStage(GameState state);
    Task HandleEndOfRound(GameState state);
    Card ConvertToHoldemPokerCard(PlayerCard card);
    void CalculateLeavePenalty(GameState state);
}