using Core.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs;

public class LobbyHub : Hub
{
    private readonly ILobbyStateManager _lobbyStateManager;
    private readonly ITableService _tableService;
    private readonly IUserService _userService;

    public LobbyHub(ILobbyStateManager lobbyStateManager, ITableService tableService, IUserService userService)
    {
        _lobbyStateManager = lobbyStateManager;
        _tableService = tableService;
        _userService = userService;
    }

    public async Task CreateLobby(int tableId)
    {
        var user = await _userService.GetLoggedInUser(Context.User!);
        if (user is null)
        {
            await Clients.Caller.SendAsync("Error", "User not found");
        }
    }
}