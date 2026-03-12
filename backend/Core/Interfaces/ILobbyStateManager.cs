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
    Task SaveInviteAsync(string inviteId, LobbyInvite invite);
    Task<LobbyInvite?> GetInviteAsync(string inviteId);
    Task DeleteInviteAsync(string inviteId);
    Task AddUserInviteAsync(string userId, string inviteId);
    Task RemoveUserInviteAsync(string userId, string inviteId);
    Task<List<string>> GetUserInviteIdsAsync(string userId);
}