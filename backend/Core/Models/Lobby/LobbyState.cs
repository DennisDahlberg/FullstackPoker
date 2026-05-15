namespace Core.Models.Lobby;

public class LobbyState
{
    public string LobbyId { get; set; } =  Guid.NewGuid().ToString();
    public string HostUserId { get; set; } = null!;
    public string HostUsername { get; set; } = null!;
    public string? HostProfileImageUrl { get; set; }
    public int TableId { get; set; }
    public List<LobbyPlayer> Players { get; set; } = [];
    public List<int> BotIds { get; set; } = [];
}