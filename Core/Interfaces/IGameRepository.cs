using Core.Models.Games;

namespace Core.Interfaces;

public interface IGameRepository
{
    Task SaveGameAsync(Game game);
}