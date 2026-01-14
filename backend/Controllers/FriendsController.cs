using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("[Controller]")]
public class FriendsController : Controller
{
    public async Task<IActionResult> SendFriendRequestAsync()
    {
        return Ok();
    }
}