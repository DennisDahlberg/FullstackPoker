using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class StatisticController : Controller
{
    public IActionResult GetStatistics()
    {
        return Ok();
    }
}