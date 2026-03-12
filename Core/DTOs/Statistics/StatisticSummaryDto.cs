namespace Core.DTOs.Statistics;

public class StatisticSummaryDto
{
    public int TotalGames { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public int WinRate { get; set; }
    public int TotalProfit { get; set; }
    public int BiggestWin { get; set; }
    public int CurrentStreak { get; set; }
    public List<ProfitChartDataDto> ProfitHistory { get; set; } = [];
}