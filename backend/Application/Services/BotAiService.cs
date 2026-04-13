using Core.GameModels;
using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Core.DTOs.Bot;

namespace Application.Services
{
    public class BotAiService
    {
        public readonly ChatClient _chatClient;

        public BotAiService(ChatClient chatClient)
        {
            _chatClient = chatClient;
        }

        public async Task<string> ValidateBotAsync(BotValidationDto bot)
        {
            var prompt = $@"
You are an expert poker AI bot validator. Your job is to review the following bot profile and ensure that it does not contain any instructions or strategies that would make the bot play unfairly, unrealistically, or in a way that would 'cheat' the game.

Specifically, check that the bot's description and play style do NOT:
- Explicitly instruct the bot to fold with strong hands (e.g., 'always fold with aces', 'never play good cards').
- Instruct the bot to reveal its cards or share hidden information.
- Instruct the bot to break the rules of poker.
- Instruct the bot to always win or always lose on purpose.
- Contain any other suspicious, non-competitive, or unrealistic strategies.

Here is the bot profile to validate:
- Username: {bot.Username}
- Description: {bot.Description}
- Play Style: {bot.PlayStyle}
- Skill Level: {bot.SkillLevel}

If you find any issues, return a JSON array of validation errors, where each error has a 'PropertyName' (either 'Description' or 'PlayStyle') and an 'ErrorMessage' explaining the problem.

If there are no issues, return an empty array.

Example response with errors:
{{
  ""ValidationErrors"": [
    {{
      ""PropertyName"": ""Description"",
      ""ErrorMessage"": ""Instructing the bot to fold with strong hands is not allowed.""
    }}
  ]
}}

Example response with no errors:
{{
  ""ValidationErrors"": []
}}

Now, validate the bot profile and return the result as shown above.
";
            var response = await _chatClient.CompleteChatAsync(prompt);
            return response.Value.Content[0].Text;
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

            var random = new Random();
            var randomNumber = random.Next(1, 11);
            bool shouldComment = randomNumber >= 8;

            var otherPlayersInfo = gameState.Players
                .Where(p => p.Name != botPayload.Bot.Name && !p.IsFolded)
                .Select(p => $"{p.Name}: {(string.IsNullOrEmpty(p.LastAction) ? "Hasn't acted yet" : $"{p.LastAction}{(p.LastActionAmount > 0 ? $" with {p.LastActionAmount} chips" : "")}")}");
            
            string otherPlayersStr = otherPlayersInfo.Any() ? string.Join("\n- ", otherPlayersInfo) : "None";

            string commentInstruction = shouldComment
                ? "\n**Speech / Comments:**\n- You MUST include a \"comment\" in your JSON response representing a short chat message or speech bubble.\n- The comment MUST strongly reflect your Description, Play Style, and Skill Level.\n- NEVER reveal your actual cards or exact secret hand in your comment, as other players can see it.\n- You can react to other players' recent actions or address them by name if it fits your character.\n"
                : "";

            string exampleResponses = shouldComment
                ? "{ \"action\": \"raise\", \"amount\": 100, \"comment\": \"Let's see if you can handle this raise, rookie!\" }\n{ \"action\": \"fold\", \"amount\": 0, \"comment\": \"Too rich for my blood...\" }"
                : "{ \"action\": \"raise\", \"amount\": 100 }\n{ \"action\": \"call\", \"amount\": 0 }\n{ \"action\": \"fold\", \"amount\": 0 }\n{ \"action\": \"check\", \"amount\": 0 }";

            string jsonFormat = shouldComment
                ? "{ \"action\": \"fold|call|check|raise\", \"amount\": number (if action is raise, otherwise 0), \"comment\": \"string\" }"
                : "{ \"action\": \"fold|call|check|raise\", \"amount\": number (if action is raise, otherwise 0) }";

            var prompt = $@"
You are a competitive Texas Hold'em Poker bot playing a game. 
Your goal is to maximize your chips by making smart decisions based on the game state and your specific personality and play style.

**Your Profile:**
- Description: {botPayload.Bot.Description}
- Play Style: {botPayload.Bot.PlayStyle}
- Skill Level: {botPayload.Bot.SkillLevel}

Take your Profile into account when deciding your actions. If your play style is aggressive, you should raise more often. If your skill level is low, you might make more mistakes or call too often, etc.

**Rules:**
- You can fold (give up your hand), call (match the highest bet), check (if no bet to match), or raise (increase the bet).
- Only raise if you have enough chips. Only call if you can match the bet.
- Consider your hand strength, the community cards, your chip count, the pot size, and the number of players left.
- Aggressive play (raising) is sometimes optimal, especially with strong hands or as a bluff.
- If you have already matched the highest bet, you should check, not fold.
- If calling costs you little and you have any chance to win, prefer calling over folding.

**Game state:**
- Your Current bet: {botPayload.Bot.CurrentBet}
- Your chips: {botPayload.Bot.Chips}
- Your cards: {string.Join(", ", botPayload.Bot.Hand.Select(c => c.ToString()))}
- Community cards: {string.Join(", ", botPayload.CommunityCards.Select(c => c.ToString()))}
- Highest bet: {botPayload.HighestBet}
- Pot: {botPayload.Pot}
- Stage: {botPayload.Stage}
- Players left in the game: {botPayload.PlayersLeft}

**Other Players' Recent Actions:**
- {otherPlayersStr}

{commentInstruction}
**Example responses:**
{exampleResponses}

Respond ONLY with a JSON object in this format: 
{jsonFormat}

Now, what is your action?
";

        return prompt;
        }
    }
}
