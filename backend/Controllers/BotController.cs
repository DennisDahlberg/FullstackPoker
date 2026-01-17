using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class BotController
{
    [HttpGet]
    public async Task<IActionResult> GetAllBotsAsync()
    {
        return Ok();
    }
}