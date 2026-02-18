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
}