using Core.Models.Games;

namespace Core.DTOs.Statistics;

public class PlayerGameStatJoined
{
    public PlayerGameStat Stat { get; set; } = null!;
    public Models.Games.Game Game { get; set; } = null!;
}