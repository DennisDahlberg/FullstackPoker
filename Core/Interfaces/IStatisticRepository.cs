using Core.DTOs.Statistics;
using Core.Models.Games;

namespace Core.Interfaces;

public interface IStatisticRepository
{
    Task<List<PlayerGameStat>> GetPlayerGameStatsAsync(string userId);
    Task<(List<PlayerGameStatJoined> Items, int Total)> GetPaginatedPlayerGameStatsAsync(string userId, int page, int pageSize);
}