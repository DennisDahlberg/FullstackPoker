namespace Core.Models.Lobby;

public class LobbyPlayer
{
    public string UserId { get; set; } = null!;
    public string Username { get; set; } = null!;
    public bool IsHost { get; set; } = false;
    public bool IsReady { get; set; } = false;
}