using Application.Services;
using backend.Hubs;
using Core.DTOs.Friend;
using Core.Models;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class FriendsController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly UserService _userService;
    private readonly FriendService _friendService;
    private readonly IHubContext<FriendsHub> _hubContext;
    
    public FriendsController(UserManager<ApplicationUser> userManager, UserService userService, FriendService friendService, IHubContext<FriendsHub> hubContext)
    {
        _userManager = userManager;
        _userService = userService;
        _friendService = friendService;
        _hubContext = hubContext;
    }
    
    [HttpPost("send")]
    public async Task<IActionResult> SendFriendRequestAsync([FromBody] string username)
    {
        var currentUser = await _userService.GetLoggedInUser(User);
        var targetUser = await _userService.GetUserByUsername(username);
        if (targetUser == null)
            return NotFound("User not found");

        var friendRequestDto = new CreateFriendRequestDTO { Requester = currentUser, Addressee = targetUser };
        var result = await _friendService.CreateFriendRequest(friendRequestDto);
        
        if (result.IsFailed)
            return BadRequest(result.Errors);
        
        await _hubContext.Clients.User(targetUser.Id)
            .SendAsync("ReceiveFriendRequest", currentUser.UserName);
        return Ok();
    }
}