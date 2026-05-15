namespace Core.Models.Lobby;

public class LobbyInvite
{
    public string InviteId { get; set; } = Guid.NewGuid().ToString();
    public string LobbyId { get; set; } = string.Empty;
    public string HostUsername { get; set; } = string.Empty;
    public string? HostProfileImageUrl { get; set; }
    public int TableId { get; set; }
    public string InvitedUserId { get; set; } = string.Empty;
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}