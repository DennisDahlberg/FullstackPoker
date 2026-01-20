using Application.Services;
using backend.Services;
using Core.GameModels;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
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

        public GameController(GameService gameService, CurrentUserService currentUserService)
        {
            _gameService = gameService;
            _currentUserService = currentUserService;
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
