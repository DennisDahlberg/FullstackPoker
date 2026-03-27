using Application.Services;
using Core.DTOs.Bot;
using Core.Interfaces;
using FluentValidation;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class BotController : Controller
{
    private readonly IBotService _botService;
    private readonly IUserService _userService;
    private readonly IValidator<CreateBotDto> _createValidator;
    private readonly IValidator<UpdateBotDto> _updateValidator;

    public BotController(IBotService botService, IUserService userService, IValidator<CreateBotDto> createValidator, IValidator<UpdateBotDto> updateValidator)
    {
        _botService = botService;
        _userService = userService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllBotsAsync()
    {
        var result = await _botService.GetAllBotsAsync();

        return Ok(result);
    }

    [HttpGet("user-created")]
    public async Task<IActionResult> GetUserCreatedBotAsync()
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "No user found" });
        
        var bots = await _botService.GetAllUserCreatedBotsAsync(userId);

        return Ok(bots);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateBotAsync([FromForm] CreateBotDto bot, IFormFile? profileImage)
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "No user found" });
               
        var validationResult = await _createValidator.ValidateAsync(bot);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);
        
        var aiValidationResult = await _botService.ValidateBotAsync(bot.Adapt<BotValidationDto>());
        if (aiValidationResult.ValidationErrors?.Count > 0)
            return BadRequest(aiValidationResult.ValidationErrors);

        var result = await _botService.CreateBotAsync(bot);
        if (result.IsSuccess)
            return Ok();

        if (result.Value != null && result.Value.ValidationErrors?.Count > 0)
        {
            return BadRequest(result.Value);
        }
        
        return BadRequest(new {message = "Failed to create bot"});
    }

    [HttpPut("{botId}")]
    public async Task<IActionResult> UpdateBotAsync([FromRoute] int botId, [FromBody] UpdateBotDto bot)
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "No user found" });
    
        var validationResult = await _updateValidator.ValidateAsync(bot);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);
        
        var aiValidationResult = await _botService.ValidateBotAsync(bot.Adapt<BotValidationDto>());
        if (aiValidationResult.ValidationErrors?.Count > 0)
            return BadRequest(aiValidationResult.ValidationErrors);
        
        var result = await _botService.UpdateBotAsync(bot);
        if (result.IsFailed)
            return BadRequest(new {message = "Failed to update bot"});
        
        return Ok();
    }

    [HttpDelete("{botId}")]
    public async Task<IActionResult> DeleteBotAsync([FromRoute] int botId)
    {
        var userId = _userService.GetLoggedInUserId(User);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "No user found" });
        
        var result = await _botService.DeleteBotAsync(botId);
        if (result.IsFailed)
            return BadRequest(new {message = "Failed to delete bot"});

        return Ok();
    }
}