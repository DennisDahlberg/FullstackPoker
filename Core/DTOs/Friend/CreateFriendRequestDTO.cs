using Core.Models;

namespace Core.DTOs.Friend;

public class CreateFriendRequestDTO
{
    public FriendStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string RequesteId { get; set; } = null!;

    public string AddresseeId { get; set; } = null!;
}