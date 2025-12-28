using Core.GameModels;
using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class BotAiService
    {
        public readonly ChatClient _chatClient;

        public BotAiService(ChatClient chatClient)
        {
            _chatClient = chatClient;
        }

        public async Task<string> GetBotAction(GameState gameState)
        {
            var prompt = BuildBotPrompt(gameState);
            var response = await _chatClient.CompleteChatAsync(prompt);
            return response.Value.Content[0].Text;
        }

        public string BuildBotPrompt(GameState gameState)
        {
            var botPayload = new BotActionPayload
            {
                Bot = gameState.Players[gameState.CurrentPlayerIndex],
                HighestBet = gameState.HighestBet,
                CommunityCards = gameState.CommunityCards
                    .Where(c => c.IsHidden == false)
                    .ToList(),
                Pot = gameState.Pot,
                Stage = gameState.Stage,
                PlayersLeft = gameState.Players
                    .Count(p => p.IsFolded == false),               
            };

            var prompt = $@"
You are a competitive Texas Hold'em Poker bot. Your goal is to maximize your chips by making smart decisions based on the game state. 

**Rules:**
- You can fold (give up your hand), call (match the highest bet), check (if no bet to match), or raise (increase the bet).
- Only raise if you have enough chips. Only call if you can match the bet.
- Consider your hand strength, the community cards, your chip count, the pot size, and the number of players left.
- Aggressive play (raising) is sometimes optimal, especially with strong hands or as a bluff.
- If you have already matched the highest bet, you should check, not fold.
- If calling costs you little and you have any chance to win, prefer calling over folding.

**Game state:**
- Your Current bet: {botPayload.Bot.CurrentBet}
- Your cards: {string.Join(", ", botPayload.Bot.Hand.Select(c => c.ToString()))}
- Community cards: {string.Join(", ", botPayload.CommunityCards.Select(c => c.ToString()))}
- Highest bet: {botPayload.HighestBet}
- Pot: {botPayload.Pot}
- Stage: {botPayload.Stage}
- Players left in the game: {botPayload.PlayersLeft}

**Example responses:**
{{ ""action"": ""raise"", ""amount"": 100 }}
{{ ""action"": ""call"", ""amount"": 0 }}
{{ ""action"": ""fold"", ""amount"": 0 }}
{{ ""action"": ""check"", ""amount"": 0 }}

Respond ONLY with a JSON object in this format: 
{{ ""action"": ""fold|call|check|raise"", ""amount"": number (if action is raise, otherwise 0) }}

Now, what is your action?
";

        return prompt;
        }
    }
}
