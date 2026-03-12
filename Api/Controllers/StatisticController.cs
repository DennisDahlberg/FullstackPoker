using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class StatisticController : Controller
{
    private readonly IUserService _userService;
    private readonly IStatisticService _statisticService;

    public StatisticController(IUserService userService, IStatisticService statisticService)
    {
        _userService = userService;
        _statisticService = statisticService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var user = await _userService.GetLoggedInUser(User);
        if (user is null)
            return Unauthorized();

        var summary = await _statisticService.GetStatisticSummaryAsync(user.Id);
        return Ok(summary);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetGameHistory([FromQuery]  int page = 1, [FromQuery]  int pageSize = 5)
    {
        var user = await _userService.GetLoggedInUser(User);
        if (user is null)
            return Unauthorized();
        
        if (page < 1)
            return BadRequest(new { message = "Invalid page number" });

        var result = await _statisticService.GetGameHistoryAsync(user.Id, page, pageSize);
        
        return Ok(result);
    }
}