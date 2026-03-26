using Application.Services;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class BotController : Controller
{
    private readonly IBotService _botService;
    private readonly IUserService _userService;

    public BotController(IBotService botService, IUserService userService)
    {
        _botService = botService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBotsAsync()
    {
        var result = await _botService.GetAllBotsAsync();

        return Ok(result);
    }

    [HttpGet("user-created")]
    public async Task<IActionResult> GetUserCreatedBotAsync()
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "No user found" });
        
        var bots = await _botService.GetAllUserCreatedBotsAsync(userId);

        return Ok(bots);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBotAsync()
    {
        
    }
}