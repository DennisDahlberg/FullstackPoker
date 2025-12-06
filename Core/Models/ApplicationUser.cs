using Microsoft.AspNetCore.Identity;

namespace Core.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string RefreshToken { get; set; } = null!;
        public DateTime RefreshTokenExpires { get; set; }
        public string Rank { get; set; } = null!;
        public decimal Balance { get; set; }
    }
}
