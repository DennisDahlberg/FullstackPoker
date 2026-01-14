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

    [HttpGet("find")]
    public async Task<IActionResult> FindUsersAsync([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            return BadRequest(new { message = "Query must be at least 2 characters" });

        var user = await _userService.GetLoggedInUser(User);
        var result = await _friendService.FindUsersAsync(user.Id, query);
        
        return Ok(result);
    }
    
    [HttpPost("send")]
    public async Task<IActionResult> SendFriendRequestAsync([FromBody] string username)
    {
        var currentUser = await _userService.GetLoggedInUser(User);
        var targetUser = await _userService.GetUserByUsername(username);
        if (targetUser == null)
            return NotFound(new { message = "User not found" });

        if (targetUser.Id == currentUser.Id)
            return BadRequest(new { message = "Cannot send friend request to yourself" });

        var friendRequestDto = new CreateFriendRequestDTO { RequesteId = currentUser.Id, AddresseeId = targetUser.Id };
        var result = await _friendService.CreateFriendRequest(friendRequestDto);
        
        if (result.IsFailed)
            return BadRequest(new { message = result.Errors.FirstOrDefault()?.Message ?? "Failed to send friend request" });
        
        await _hubContext.Clients.User(targetUser.Id)
            .SendAsync("ReceiveFriendInvite", currentUser.UserName);
            
        return Ok(new { message = "Friend request sent successfully" });
    }

    [HttpGet("requests")]
    public async Task<IActionResult> GetFriendRequestsAsync()
    {
        var userId = _userService.GetLoggedInUserId(User);
        
        
    }

    [HttpPost("accept/{requestId}")]
    public async Task<IActionResult> AcceptFriendRequestAsync([FromRoute] int requestId)
    {
        var userId = _userService.GetLoggedInUserId(User);
        var result = await _friendService.AcceptFriendRequestAsync(requestId, userId);

        if (result.IsFailed)
            return BadRequest(new { message = result.Errors.FirstOrDefault()?.Message ?? "Failed to accept friend request" });
        
        await _hubContext.Clients.User(result.Value)
            .SendAsync("FriendRequestAccepted", User.Identity!.Name);
        
        return Ok(new { message = "Friend request accepted successfully" });
    }
}