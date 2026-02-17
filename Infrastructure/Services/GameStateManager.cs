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
}