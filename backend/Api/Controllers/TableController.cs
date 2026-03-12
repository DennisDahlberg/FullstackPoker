using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class TableController : Controller
{
    private readonly ITableService _tableService;
    
    public TableController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTablesAsync()
    {
        var result = await _tableService.GetTablesAsync();
        return Ok(result);
    }
}