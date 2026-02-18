using System.Text.Json;
using Core.GameModels;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class GameStateManager
{
    private readonly IConnectionMultiplexer _redis;
    private readonly string _instanceName;

    public GameStateManager(IConnectionMultiplexer redis, IConfiguration configuration)
    {
        _redis = redis;
        _instanceName = configuration["Redis:InstanceName"] ?? "PokerGame:";
    }

    private string GetKey(string gameId) => $"{_instanceName}game:{gameId}";
    private string GetUserGameKey(string userId) => $"{_instanceName}user:{userId}:currentGame";

    public async Task<GameState?> GetGameStateAsync(string gameId)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(gameId);
        var json = await db.StringGetAsync(key);
        
        if (!json.HasValue)
            return null;
        
        return JsonSerializer.Deserialize<GameState>(json!);
    }

    public async Task SaveGameStateAsync(string gameId, GameState state)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(gameId);
        var json = JsonSerializer.Serialize(state);
        await db.StringSetAsync(key, json, TimeSpan.FromHours(3));
    }

    public async Task DeleteGameStateAsync(string gameId)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(gameId);
        await db.KeyDeleteAsync(key);
    }

    public async Task<bool> GameExistsAsync(string gameId)
    {
        var db = _redis.GetDatabase();
        var key = GetKey(gameId);
        return await db.KeyExistsAsync(key);
    }

    public async Task<string?> GetUserCurrentGameAsync(string userId)
    {
        var db = _redis.GetDatabase();
        var key = GetUserGameKey(userId);
        var gameId = await db.StringGetAsync(key);
        return gameId.HasValue ? gameId.ToString() : null;
    }
    
    public async Task SaveUserCurrentGameAsync(string userId, string gameId)
    {
        var db = _redis.GetDatabase();
        var key = GetUserGameKey(userId);
        await db.StringSetAsync(key, gameId, TimeSpan.FromHours(3));
    }

    public async Task DeleteUserCurrentGameAsync(string userId)
    {
        var db = _redis.GetDatabase();
        var key = GetUserGameKey(userId);
        await db.KeyDeleteAsync(key);
    }
}