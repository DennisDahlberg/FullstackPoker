using System.Text.RegularExpressions;
using Core.DTOs.Statistics;
using Core.Interfaces;

namespace Application.Services;

public class StatisticService : IStatisticService
{
    private readonly IStatisticRepository _statRepository;

    public StatisticService(IStatisticRepository statRepository)
    {
        _statRepository = statRepository;
    }

    public async Task GetSummaryAsync()
    {
        await Task.CompletedTask;
    }

    public async Task<StatisticSummaryDto> GetStatisticSummaryAsync(string userId)
    {
        var stats = await _statRepository.GetPlayerGameStatsAsync(userId);

        var totalGames = stats.Count;
        var wins = stats.Count(g => g.IsWinner);
        var biggestWin = stats
            .Select(g => g.Profit)
            .DefaultIfEmpty(0)
            .Max();
        var streak = 0;
        foreach (var stat in stats)
        {
            if (stat.IsWinner) streak++;
            else break;
        }

        return new StatisticSummaryDto
        {
            TotalGames =  totalGames,
            Wins = wins,
            Losses = totalGames - wins,
            WinRate = (int)Math.Round((double)wins / totalGames * 100),
            TotalProfit = stats.Sum(g => g.Profit),
            BiggestWin = biggestWin,
            CurrentStreak =  streak
        };
    }

    public async Task<GameHistoryResponse> GetGameHistoryAsync(string userId,  int page, int pageSize)
    {
        var (rows, total) = await _statRepository
            .GetPaginatedPlayerGameStatsAsync(userId, page, pageSize);

        var items = rows.Select(x =>
        {
            var duration = x.Game.FinishedAt - x.Game.StartedAt;
            var durationStr = duration.TotalSeconds switch
            {
                >= 3600 => $"{duration.Hours}h {duration.Minutes}m {duration.Seconds}s",
                >= 60   => $"{duration.Minutes}m {duration.Seconds}s",
                _       => $"{duration.Seconds}s"
            };

            var bestHandStr = Regex.Replace(x.Stat.Hand, "(?<!^)([A-Z])", " $1");

            return new GameHistoryItemDto
            {
                Id = x.Game.Id,
                Date = x.Game.FinishedAt.ToString("MMM d, yyyy"),
                BuyIn = x.Stat.ChipsStart,
                Result = x.Stat.IsWinner ? "win" : "loss",
                Profit = x.Stat.Profit,
                Duration = durationStr,
                BestHand = bestHandStr,
                Players = x.Game.PlayerCount,
                ChipsPostGame = x.Stat.ChipsEnd
            };
        }).ToList();

        return new GameHistoryResponse
        {
            Games = items,
            Total = total,
            Page = page,
            PageSize = pageSize,
            HasMore = page * pageSize < total
        };
    }
}