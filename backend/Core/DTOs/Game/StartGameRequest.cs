namespace Core.DTOs.Game;

public class StartGameRequest
{
    public int TableId { get; set; }
    public List<int> BotIds { get; set; } = [];
}