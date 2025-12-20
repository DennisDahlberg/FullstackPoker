using Core.GameModels;
using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

        public void GetBotAction(GameState gameState)
        {
            
        }

        public string BuildBotPrompt(GameState gameState)
        {
            var botPayload = new BotActionPayload
            {
                Bot = gameState.Players[gameState.CurrentPlayerIndex],
                HighestBet = gameState.HighestBet,
                CommunityCards = (List<Card>)gameState.CommunityCards
                    .Where(c => c.IsHidden == false),
                Pot = gameState.Pot,
                Stage = gameState.Stage,
                PlayersLeft = gameState.Players
                    .Count(p => p.IsFolded == false),               
            };

            var prompt = $@"
You are an Texas Hold'em Poker player bot. 
Given the following game state, decide your next action. 
Respond ONLY with a JSON object in this format: 
{{ ""action"": ""fold|call|check|raise"", ""amount"": int (if action is raise, otherwise 0) }}

Game state:
- Your state: {botPayload.Bot}
- Highest bet: {botPayload.HighestBet}
- Community cards: {string.Join(", ", botPayload.CommunityCards.Select(c => c.ToString()))}
- Pot: {botPayload.Pot}
- Stage: {botPayload.Stage}
- Players left: {botPayload.PlayersLeft}

Example response:
{{ ""action"": ""raise"", ""amount"": 100 }}

Now, what is your action?
";

        return prompt;
        }
    }
}
