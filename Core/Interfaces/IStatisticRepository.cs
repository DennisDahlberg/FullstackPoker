using Core.DTOs.Statistics;
using Core.Models.Games;

namespace Core.Interfaces;

public interface IStatisticRepository
{
    Task<(List<PlayerGameStatJoined> Items, int Total)> GetPlayerGameStatsAsync(string userId, int page, int pageSize);
}