using Application.Services;
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

        public GameController(GameService gameService)
        {
            _gameService = gameService;
        }

        [HttpGet("start")]
        public IActionResult Start()
        {
            var json = HttpContext.Session.GetString("GameState");
            GameState gameState = json != null
                ? JsonSerializer.Deserialize<GameState>(json)!
                : new GameState();

            _gameService.InitializeGame();

            return Ok();
        }
    }
}
