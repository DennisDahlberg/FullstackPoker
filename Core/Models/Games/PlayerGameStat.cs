namespace Core.Models.Games;

public class PlayerGameStat
{
    public int Id { get; set; }
    public int GameId { get; set; }
    public string UserId { get; set; } = null!;
    public bool IsWinner { get; set; }
    public int ChipsStart { get; set; }
    public int ChipsEnd { get; set; }
    public int Profit { get; set; }
    public int HandsWon { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}