using Core.Interfaces;

namespace Application.Services;

public class StatisticService : IStatisticService
{
    public async Task GetSummaryAsync()
    {
        await Task.CompletedTask;
    }
}