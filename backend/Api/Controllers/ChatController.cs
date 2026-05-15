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
    private readonly IChatService _chatService;

    public ChatController(IUserService userService, IChatService chatService)
    {
        _userService = userService;
        _chatService = chatService;
    }

    [HttpGet("{friendId}")]
    public async Task<IActionResult> GetMessagesAsync([FromRoute] string friendId)
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (userId == null)
            return Unauthorized();

        var messages = await _chatService.GetMessagesAsync(userId, friendId);
        return Ok(messages);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversationsAsync()
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (userId == null)
            return Unauthorized();
        
        var conversations = await _chatService.GetConversationsAsync(userId);
        return Ok(conversations);
    }
    
}