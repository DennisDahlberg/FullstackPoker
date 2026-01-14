using Application.Services;
using Core.DTOs.Friend;
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
    private readonly FriendService _friendService;
    
    public FriendsController(UserManager<ApplicationUser> userManager, UserService userService, FriendService friendService)
    {
        _userManager = userManager;
        _userService = userService;
        _friendService = friendService;
    }
    
    [HttpPost("send")]
    public async Task<IActionResult> SendFriendRequestAsync([FromBody] string username)
    {
        var currentUser = await _userService.GetLoggedInUser(User);
        var targetUser = await _userService.GetUserByUsername(username);
        if (targetUser == null)
            return NotFound("User not found");

        var friendRequestDto = new CreateFriendRequestDTO { Requester = currentUser, Addressee = targetUser };
        await _friendService.CreateFriendRequest(friendRequestDto);
        
        return Ok();
    }
}