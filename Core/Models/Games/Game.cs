using Core.GameModels;

namespace Core.Models.Games;

public class Game
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset FinishedAt { get; set; }
    public string WinnerId { get; set; } = null!;
}