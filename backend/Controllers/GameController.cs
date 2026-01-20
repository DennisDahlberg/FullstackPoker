using Application.Services;
using backend.Services;
using Core.GameModels;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Core.DTOs.Game;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[Controller]")]
    public class GameController : Controller
    {
        private readonly GameService _gameService;
        private readonly CurrentUserService _currentUserService;
        private readonly BotService _botService;
        private readonly ITableService _tableService;

        public GameController(GameService gameService, CurrentUserService currentUserService, ITableService tableService, BotService botService)
        {
            _gameService = gameService;
            _currentUserService = currentUserService;
            _tableService = tableService;
            _botService = botService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> InitializeGame([FromBody] StartGameRequest request)
        {
            var table = await _tableService.GetTableByIdAsync(request.TableId);
            if (table.IsFailed)
                return BadRequest(new {message = table.Errors.FirstOrDefault()?.Message 
                                                 ?? "Failed to find table by given id"});

            var bots = await _botService
                .GetBotsForGameAsync(request.BotIds);
            if (bots.IsFailed)
                return BadRequest(new { message = bots.Errors.FirstOrDefault()?.Message
                                                  ?? "Failed to find bots for game" });
            
            return Ok();
        }
        
        [HttpGet("start")]
        public IActionResult Start()
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is not null)
            {
                var gameState = JsonSerializer.Deserialize<GameState>(json);
                return Ok(gameState);
            }

            var playerInfo = _currentUserService.GetPlayerInfo();
            var newGameState = _gameService.InitializeGame(playerInfo);

            HttpContext.Session.SetString("GameState", JsonSerializer.Serialize(newGameState));
            return Ok(newGameState);
        }

        [HttpPost("action")]
        public IActionResult PlayerAction([FromBody] PlayerActionRequest playerAction)
        {
            var json = HttpContext.Session.GetString("GameState");
            if (json is null)
                return RedirectToAction(nameof(Start));

            var gameState = JsonSerializer.Deserialize<GameState>(json);

            _gameService.HandlePlayerAction(playerAction, gameState!);

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
    }
}
