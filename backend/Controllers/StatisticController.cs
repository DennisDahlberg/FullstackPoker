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
}