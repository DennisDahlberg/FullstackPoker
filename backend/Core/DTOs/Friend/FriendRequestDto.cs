namespace Core.DTOs.Friend;

public class FriendRequestDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public DateTime SentAt { get; set; }
    public string? ProfileImageUrl { get; set; }
}