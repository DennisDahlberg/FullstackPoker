using Application.Services;
using Core.GameModels;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Core.DTOs;
using Core.DTOs.Game;
using Core.Interfaces;
using Infrastructure.Services;
using Mapster;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[Controller]")]
    public class GameController : Controller
    {
        private readonly IGameService _gameService;
        private readonly IGameHistoryService _gameHistoryService;
        private readonly IBotService _botService;
        private readonly ITableService _tableService;
        private readonly IUserService _userService;
        private readonly IGameStateManager _gameStateManager;

        public GameController(IGameService gameService, ITableService tableService, IBotService botService, IUserService userService, IGameHistoryService gameHistoryService, IGameStateManager gameStateManager)
        {
            _gameService = gameService;
            _tableService = tableService;
            _botService = botService;
            _userService = userService;
            _gameHistoryService = gameHistoryService;
            _gameStateManager = gameStateManager;
        }
    }
}
