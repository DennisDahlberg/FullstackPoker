using Core.Models;

namespace Core.DTOs.Chat;

public class ChatMessageDto
{
    public int Id { get; set; }
    public string SenderId { get; set; } = null!;
    public string RecipientId { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTimeOffset SentAt { get; set; }
    public bool IsRead { get; set; }
    public string SenderUsername { get; set; } = null!;
    public string? SenderProfileImageUrl { get; set; }
    public bool IsOwnMessage { get; set; }
}