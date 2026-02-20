namespace Core.Models.Games;

public class PlayerSessionSummary
{
    public string Duration { get; set; } = null!;
    public int TotalSeconds { get; set; }
    public int StartingChips { get; set; }
    public int FinalChips { get; set; }
    public int Profit { get; set; }
    public decimal BalanceReturned { get; set; }
    public int PenaltyAmount { get; set; }
    public bool WasEarlyLeave { get; set; }
    public int RoundsPlayed { get; set; }
}