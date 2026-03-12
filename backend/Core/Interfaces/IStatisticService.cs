using Core.DTOs.Statistics;

namespace Core.Interfaces;

public interface IStatisticService
{
    Task<StatisticSummaryDto> GetStatisticSummaryAsync(string userId);
    Task<GameHistoryResponse> GetGameHistoryAsync(string userId, int page, int pageSize);
}