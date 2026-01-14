using Core.Models;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class FriendsController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly UserService _userService;
    
    public FriendsController(UserManager<ApplicationUser> userManager, UserService userService)
    {
        _userManager = userManager;
        _userService = userService;
    }
    
    [HttpPost("send")]
    public async Task<IActionResult> SendFriendRequestAsync([FromBody] string username)
    {
        var currentUser = _userService.GetLoggedInUserId(User);
        var targetUser = await _userService.GetUserByUsername(username);
        if (targetUser == null)
            return NotFound("User not found");
        
        
        
        return Ok();
    }
}