using Core.Models;

namespace Core.DTOs.Bot;

public class BotValidationDto
{
    public string Username { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string PlayStyle { get; set; } = null!;
    public SkillLevel SkillLevel { get; set; }
}