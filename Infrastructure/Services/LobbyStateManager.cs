using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class LobbyStateManager
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
    
    
}