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
        var gameStats = await _statRepository.GetPlayerGameStatsAsync(userId);
        
        var query = gameStats.
    }
}