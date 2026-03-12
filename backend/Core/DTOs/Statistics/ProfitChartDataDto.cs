namespace Core.DTOs.Statistics;

public class ProfitChartDataDto
{
    public string Date { get; set; } = null!;
    public int Profit { get; set; }
    public int Cumulative { get; set; }
}