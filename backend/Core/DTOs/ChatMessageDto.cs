using Core.Models;

namespace Core.DTOs;

public class ChatMessageDto
{
    public int Id { get; set; }
    public string SenderId { get; set; } = null!;
    public ApplicationUser Sender { get; set; } = null!;
    public string RecipientId { get; set; } = null!;
    public ApplicationUser Recipient { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTimeOffset SentAt { get; set; }
    public bool IsRead { get; set; }
}