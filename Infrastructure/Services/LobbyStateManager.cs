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
}