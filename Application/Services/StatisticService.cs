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

    public async Task<GameHistoryResponse> GetGameHistoryAsync(string userId,  int page, int pageSize)
    {
        var (rows, total) = await _statRepository
            .GetPlayerGameStatsAsync(userId, page, pageSize);

        var items = rows.Select(x =>
        {
            var duration = x.Game.FinishedAt - x.Game.StartedAt;
            var durationStr = duration.TotalSeconds switch
            {
                >= 3600 => $"{duration.Hours}h {duration.Minutes}m {duration.Seconds}s",
                >= 60   => $"{duration.Minutes}m {duration.Seconds}s",
                _       => $"{duration.Seconds}s"
            };

            return new GameHistoryItemDto
            {
                Id = x.Game.Id,
                Date = x.Game.FinishedAt.ToString("MMM d, yyyy"),
                BuyIn = x.Stat.ChipsStart,
                Result = x.Stat.IsWinner ? "win" : "loss",
                Profit = x.Stat.Profit,
                Duration = durationStr,
                BestHand = x.Stat.Hand,
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