using Core.Models;

namespace Core.DTOs.Friend;

public class CreateFriendRequestDTO
{
    public FriendStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser Requester { get; set; } = null!;

    public ApplicationUser Addressee { get; set; } = null!;
}