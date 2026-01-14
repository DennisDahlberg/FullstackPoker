using Core.Models;

namespace Core.DTOs.Friend;

public class UserSearchResultDto
{
    public int Id { get; set; }
    public string Username { get; set; }
    public FriendStatus Status { get; set; }
}