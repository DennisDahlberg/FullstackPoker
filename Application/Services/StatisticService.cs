using Core.DTOs.Statistics;
using Core.Interfaces;

namespace Application.Services;

public class StatisticService : IStatisticService
{
    public async Task GetSummaryAsync()
    {
        await Task.CompletedTask;
    }

    public async Task<GameHistoryResponse> GetGameHistoryAsync(string userId,  int page, int pageSize)
    {
        
    }
}