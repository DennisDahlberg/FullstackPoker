namespace Core.DTOs.Bot;

public class BotDto
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string PlayStyle { get; set; } = null!;
    public string SkillLevel { get; set; } = null!;
    public string? ProfileImageUrl { get; set; }
    public bool IsUserCreated { get; set; }
}