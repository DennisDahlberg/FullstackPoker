using System.ComponentModel.DataAnnotations;
using Core.Models;

namespace Core.DTOs.Bot;

public class CreateBotDto
{
    public string Username { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string PlayStyle { get; set; } = null!;
    public SkillLevel SkillLevel { get; set; }
    public byte[]? ProfileImageData { get; set; }
    public string? ImageType { get; set; }
}