namespace Core.DTOs
{
    public class UserDTO
    {
        public string Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Rank { get; set; } = null!;
        public decimal Balance { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}
