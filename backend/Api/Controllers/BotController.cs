using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class BotController : Controller
{
    private readonly BotService _botService;

    public BotController(BotService botService)
    {
        _botService = botService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBotsAsync()
    {
        var result = await _botService.GetAllBotsAsync();

        return Ok(result);
    }
}