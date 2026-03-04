using System.Security.AccessControl;

namespace Core.DTOs.Statistics;

public class GameHistoryItemDto
{
    public string Date { get; set; } = null!;
    public int Players { get; set; }
    public int BuyIn { get; set; }
    public string Result { get; set; } = null!;
    public int Profit { get; set; }
    public string Duration { get; set; } = null!;
    public string BestHand { get; set; } = null!;
}