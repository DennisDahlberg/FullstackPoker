using Application.Services;
using backend.Services;
using Core.GameModels;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Core.DTOs;
using Core.DTOs.Game;
using Core.Interfaces;
using Infrastructure.Services;
using Mapster;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[Controller]")]
    public class GameController : Controller
    {
        private readonly GameService _gameService;
        private readonly IGameHistoryService _gameHistoryService;
        private readonly CurrentUserService _currentUserService;
        private readonly BotService _botService;
        private readonly ITableService _tableService;
        private readonly UserService _userService;

        public GameController(GameService gameService, CurrentUserService currentUserService, ITableService tableService, BotService botService, UserService userService, IGameHistoryService gameHistoryService)
        {
            _gameService = gameService;
            _currentUserService = currentUserService;
            _tableService = tableService;
            _botService = botService;
            _userService = userService;
            _gameHistoryService = gameHistoryService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> InitializeGame([FromBody] StartGameRequest request)
        {
            var table = await _tableService.GetTableByIdAsync(request.TableId);
            if (table.IsFailed)
                return BadRequest(new 
                {
                    message = table.Errors.FirstOrDefault()?.Message 
                    ?? "Failed to find table by given id"
                });

            var bots = await _botService
                .GetBotsForGameAsync(request.BotIds);
            if (bots.IsFailed)
                return BadRequest(new 
                { 
                    message = bots.Errors.FirstOrDefault()?.Message
                    ?? "Failed to find bots for game" 
                });
            var userId = _userService.GetLoggedInUserId(User);
            
            var userBalanceChangeResult = await _userService.UpdateUserBalanceAsync(userId, -table.Value.BuyIn); 
            if (userBalanceChangeResult.IsFailed)
                return BadRequest(new
                {
                    message = userBalanceChangeResult.Errors.FirstOrDefault()?.Message
                    ?? "Failed to update balance"
                });
            
            var user = await _userService.GetUserDataAsync(userId);
            if (user.IsFailed)
                return BadRequest(new
                {
                    message = user.Errors.FirstOrDefault()?.Message 
                              ?? "Failed to find user"
                });

            var gameState = _gameService.InitializeGame(user.Value, table.Value, bots.Value);
            HttpContext.Session.SetString("GameState", JsonSerializer.Serialize(gameState));
            
            return Ok();
        }
        
        [HttpGet("start")]
        public IActionResult Start()
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is null) return NotFound(new { message = "No active game found" });
            
            var gameState = JsonSerializer.Deserialize<GameState>(json);
            return Ok(gameState);
        }

        [HttpPost("action")]
        public async Task<IActionResult> PlayerAction([FromBody] PlayerActionRequest playerAction)
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is null)
                return RedirectToAction(nameof(Start));

            var gameState = JsonSerializer.Deserialize<GameState>(json);

            await _gameService.HandlePlayerAction(playerAction, gameState!);

            HttpContext.Session.SetString("GameState", JsonSerializer.Serialize(gameState));
            return Ok(gameState);
        }

        [HttpPost("bot-action")]
        public async Task<IActionResult> BotAction()
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is null)
                return RedirectToAction(nameof(Start));
            var gameState = JsonSerializer.Deserialize<GameState>(json);
            await _gameService.HandleBotAction(gameState!);
            HttpContext.Session.SetString("GameState", JsonSerializer.Serialize(gameState));
            return Ok(gameState);
        }

        [HttpPost("new-round")]
        public IActionResult NewRound()
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is null)
                return RedirectToAction(nameof(Start));
            var gameState = JsonSerializer.Deserialize<GameState>(json);
            var newGameState = _gameService.NewRound(gameState!);

            HttpContext.Session.SetString("GameState", JsonSerializer.Serialize(newGameState));
            return Ok(newGameState);
        }

        [HttpPost("leave")]
        public async Task<IActionResult> Leave()
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is null)
                return RedirectToAction(nameof(Start));
            var gameState = JsonSerializer.Deserialize<GameState>(json);
            await _gameHistoryService.UpdatePlayerBalanceFromGame(gameState);
            
            return Ok();
        }
    }
}
