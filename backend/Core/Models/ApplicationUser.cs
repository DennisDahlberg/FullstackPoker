using Microsoft.AspNetCore.Identity;

namespace Core.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string RefreshToken { get; set; } = null!;
        public DateTime RefreshTokenExpires { get; set; }
        public string Rank { get; set; } = null!;
        public int RankPoints { get; set; }
        public decimal Balance { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
