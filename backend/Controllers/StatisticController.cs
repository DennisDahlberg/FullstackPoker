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

    public StatisticController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var user = await _userService.GetLoggedInUser(User);
        if (user is null)
            return Unauthorized();
        
        return Ok();
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetGameHistry([FromQuery]  int page = 1, [FromQuery]  int pageSize = 5)
    {
        var user = await _userService.GetLoggedInUser(User);
        if (user is null)
            return Unauthorized();
        
        if (page < 1)
            return BadRequest(new { message = "Invalid page number" });
        
        return Ok();
    }
}