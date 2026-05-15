namespace Core.DTOs.Chat;

public class ConversationDto
{
    public string FriendId { get; set; } = null!;
    public string FriendUsername { get; set; } = null!;
    public string FriendProfileImageUrl { get; set; } = null!;
    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public bool IsOnline { get; set; }
}