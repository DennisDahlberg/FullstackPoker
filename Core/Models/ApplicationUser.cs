using Microsoft.AspNetCore.Identity;

namespace Core.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Rank { get; set; } = null!;
        public decimal Balance { get; set; }
    }
}
