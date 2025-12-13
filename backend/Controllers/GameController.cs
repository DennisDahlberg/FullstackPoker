using Application.Services;
using backend.Services;
using Core.GameModels;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace backend.Controllers
{
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

            return Ok(gameState);
        }
    }
}
