using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class ChatController : Controller
{
    private readonly IUserService _userService;

    public ChatController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMessagesAsync(string friendId)
    {
        var friend = await _userService.GetUserById(friendId);
        if (friend == null)
            return BadRequest();

        return Ok(new
        {
            
        });
    }
}