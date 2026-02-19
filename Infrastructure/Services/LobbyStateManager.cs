using System.Text.Json;
using Core.GameModels;
using Core.Interfaces;
using Core.Models.Lobby;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class LobbyStateManager : ILobbyStateManager
{
    private readonly IConnectionMultiplexer _redis;
    private readonly string _instanceName;
    
    public LobbyStateManager(IConnectionMultiplexer redis, IConfiguration configuration)
    {
        _redis = redis;
        _instanceName = configuration["Redis:InstanceName"] ?? "PokerGame:";
    }
    
    private string GetKey(string lobbyId) => $"{_instanceName}lobby:{lobbyId}";
    private string GetUserLobbyKey(string userId) => $"{_instanceName}user:{userId}:currentLobby";

    public async Task<LobbyState?> GetLobbyStateAsync(string lobbyId)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(lobbyId);
        var json = await db.StringGetAsync(key);
        if (json.IsNullOrEmpty)
            return null;
        
        return JsonSerializer.Deserialize<LobbyState>(json!);
    }
    
    public async Task SaveLobbyStateAsync(string lobbyId, LobbyState lobbyState)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(lobbyId);
        var json = JsonSerializer.Serialize(lobbyState);
        await db.StringSetAsync(key, json);
    }
    
    public async Task DeleteLobbyStateAsync(string lobbyId)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(lobbyId);
        await db.KeyDeleteAsync(key);
    }

    public async Task<string?> GetUserCurrentLobbyAsync(string userId)
    {
        var db = _redis.GetDatabase();
        var key = GetUserLobbyKey(userId);
        var gameId = await db.StringGetAsync(key);
        return gameId.HasValue ? gameId.ToString() : null;
    }

    public async Task SetUserCurrentLobbyAsync(string userId, string lobbyId)
    {
        var db = _redis.GetDatabase();
        var key = GetUserLobbyKey(userId);
        await db.StringSetAsync(key, lobbyId, TimeSpan.FromHours(3));
    }
    
    public async Task RemoveUserCurrentLobbyAsync(string userId)
    {
        var db = _redis.GetDatabase();
        var key = GetUserLobbyKey(userId);
        await db.KeyDeleteAsync(key);
    }

    public async Task SaveInviteAsync(string inviteId, LobbyInvite invite)
    {
        var db = _redis.GetDatabase();
        var json = JsonSerializer.Serialize(invite);
        await db.StringSetAsync($"invite:{inviteId}", json, TimeSpan.FromMinutes(30));
    }
    
    public async Task<LobbyInvite?> GetInviteAsync(string inviteId)
    {
        var db = _redis.GetDatabase();
        var json = await db.StringGetAsync($"invite:{inviteId}");
        return json.IsNullOrEmpty ? null : JsonSerializer.Deserialize<LobbyInvite>(json!);
    }
    
    public async Task DeleteInviteAsync(string inviteId)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync($"invite:{inviteId}");
    }

    public async Task AddUserInviteAsync(string userId, string inviteId)
    {
        var db = _redis.GetDatabase();
        await db.SetAddAsync($"user:{userId}:invites", inviteId);
    }

    public async Task RemoveUserInviteAsync(string userId, string inviteId)
    {
        var db = _redis.GetDatabase();
        await db.SetRemoveAsync($"user:{userId}:invites", inviteId);
    }

    public async Task<List<string>> GetUserInviteIdsAsync(string userId)
    {
        var db = _redis.GetDatabase();
        var members = await db.SetMembersAsync($"user:{userId}:invites");
        return members.Select(m => m.ToString()).ToList();
    }
}