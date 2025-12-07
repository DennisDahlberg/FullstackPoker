using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[Controller]")]
    public class GameController : Controller
    {
        [HttpPost]
        public IActionResult Start()
        {
            return Ok();
        }
    }
}
