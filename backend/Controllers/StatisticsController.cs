using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class StatisticsController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}