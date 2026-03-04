using Core.GameModels;

namespace Core.Models.Games;

public class Game
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public List<string> WinnerIds { get; set; } = null!;
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset FinishedAt { get; set; }
    public int PlayerCount { get; set; }
}