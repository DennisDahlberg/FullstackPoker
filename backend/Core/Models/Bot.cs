using System.ComponentModel.DataAnnotations;

namespace Core.Models;

public enum SkillLevel
{
    Beginner,
    Intermediate,
    Pro,
    Elite
}

public class Bot
{
    [Key]
    public int Id { get; set; }

    public string? UserId { get; set; }
    
    [Required]
    [StringLength(20, ErrorMessage = "Username can be a maximum of 20 characters long"), 
     MinLength(3,  ErrorMessage = "Username must be at least 3 characters long")]
    public string Username { get; set; } = null!;
    
    [Required]
    [StringLength(50, ErrorMessage = "Description can be a maximum of 50 characters long"), 
     MinLength(5,  ErrorMessage = "Description must be at least 5 characters long")]
    public string Description { get; set; } = null!;

    [Required] 
    [StringLength(15, ErrorMessage = "Playstyle can be a maximum of 15 characters long"), 
     MinLength(3,  ErrorMessage = "Playstyle must be at least 3 characters long")]
    public string PlayStyle { get; set; } = null!;
    
    [Required]
    public SkillLevel SkillLevel { get; set; }

    public string? ProfileImageUrl { get; set; }
    
    public bool IsUserCreated { get; set; }
}