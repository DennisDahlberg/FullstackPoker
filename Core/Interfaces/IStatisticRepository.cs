using Core.DTOs.Statistics;
using Core.Models.Games;

namespace Core.Interfaces;

public interface IStatisticRepository
{
    Task<(List<PlayerGameStatJoined> Items, int Total)> GetPaginatedPlayerGameStatsAsync(string userId, int page, int pageSize);
}