using Core.GameModels;
using Core.Models.Lobby;

namespace Core.Interfaces;

public interface ILobbyStateManager
{
    Task<LobbyState?> GetLobbyStateAsync(string lobbyId);
    Task SaveLobbyStateAsync(string lobbyId, LobbyState lobbyState);
    Task DeleteLobbyStateAsync(string lobbyId);
    Task<string?> GetUserCurrentLobbyAsync(string userId);
    Task SetUserCurrentLobbyAsync(string userId, string lobbyId);
    Task RemoveUserCurrentLobbyAsync(string userId);
}