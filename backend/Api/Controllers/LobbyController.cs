using Core.Interfaces;
using Core.Models.Lobby;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using backend.Hubs;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("[Controller]")]
public class LobbyController : Controller
{
    private readonly ILobbyStateManager _lobbyStateManager;
    private readonly IUserService _userService;
    private readonly ITableService _tableService;
    private readonly IHubContext<LobbyHub> _lobbyHubContext;

    public LobbyController(
        ILobbyStateManager lobbyStateManager,
        IUserService userService,
        ITableService tableService,
        IHubContext<LobbyHub> lobbyHubContext)
    {
        _lobbyStateManager = lobbyStateManager;
        _userService = userService;
        _tableService = tableService;
        _lobbyHubContext = lobbyHubContext;
    }

    [HttpGet("invites")]
    public async Task<IActionResult> GetPendingInvites()
    {
        var userId = _userService.GetLoggedInUserId(User);
        var inviteIds = await _lobbyStateManager.GetUserInviteIdsAsync(userId);

        var invites = new List<object>();
        foreach (var inviteId in inviteIds)
        {
            var invite = await _lobbyStateManager.GetInviteAsync(inviteId);
            if (invite is not null)
            {
                invites.Add(new
                {
                    invite.InviteId,
                    invite.LobbyId,
                    invite.HostUsername,
                    invite.TableId,
                    invite.SentAt,
                    invite.HostProfileImageUrl
                });
            }
            else
            {
                await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);
            }
        }

        return Ok(invites);
    }

    [HttpPost("invites/{inviteId}/accept")]
    public async Task<IActionResult> AcceptInvite([FromRoute] string inviteId)
    {
        var userId = _userService.GetLoggedInUserId(User);
        var user = await _userService.GetUserById(userId);

        if (user is null)
            return BadRequest(new { message = "User not found" });

        var invite = await _lobbyStateManager.GetInviteAsync(inviteId);
        if (invite is null)
            return BadRequest(new { message = "Invite not found or expired" });

        if (invite.InvitedUserId != userId)
            return BadRequest(new { message = "This invite is not for you" });

        var lobby = await _lobbyStateManager.GetLobbyStateAsync(invite.LobbyId);
        if (lobby is null)
        {
            await _lobbyStateManager.DeleteInviteAsync(inviteId);
            await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);
            return BadRequest(new { message = "Lobby no longer exists" });
        }

        var existingLobbyId = await _lobbyStateManager.GetUserCurrentLobbyAsync(userId);
        if (existingLobbyId is not null)
            return BadRequest(new { message = "You are already in a lobby. Leave it first." });

        var totalPlayers = lobby.Players.Count + lobby.BotIds.Count;
        if (totalPlayers >= 8)
            return BadRequest(new { message = "Lobby is full" });

        var tableResult = await _tableService.GetTableByIdAsync(lobby.TableId);
        if (tableResult.IsFailed)
            return BadRequest(new { message = "Table configuration not found" });

        if (user.Balance < tableResult.Value.BuyIn)
            return BadRequest(new { message = $"Insufficient balance. Need ${tableResult.Value.BuyIn}" });

        lobby.Players.Add(new LobbyPlayer
        {
            UserId = user.Id,
            Username = user.UserName,
            IsHost = false,
            IsReady = false,
            ProfileImageUrl = user.ProfileImageUrl,
        });

        await _lobbyStateManager.SaveLobbyStateAsync(invite.LobbyId, lobby);
        await _lobbyStateManager.SetUserCurrentLobbyAsync(userId, invite.LobbyId);

        await _lobbyStateManager.DeleteInviteAsync(inviteId);
        await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);

        await _lobbyHubContext.Clients.Group($"lobby_{invite.LobbyId}")
            .SendAsync("LobbyUpdated", lobby);
        await _lobbyHubContext.Clients.Group($"lobby_{invite.LobbyId}")
            .SendAsync("PlayerJoined", user.UserName);

        return Ok(new { tableId = lobby.TableId, lobbyId = invite.LobbyId });
    }

    [HttpPost("invites/{inviteId}/decline")]
    public async Task<IActionResult> DeclineInvite([FromRoute] string inviteId)
    {
        var userId = _userService.GetLoggedInUserId(User);

        var invite = await _lobbyStateManager.GetInviteAsync(inviteId);
        if (invite is null)
            return Ok(new { message = "Invite already removed" });

        if (invite.InvitedUserId != userId)
            return BadRequest(new { message = "This invite is not for you" });

        await _lobbyStateManager.DeleteInviteAsync(inviteId);
        await _lobbyStateManager.RemoveUserInviteAsync(userId, inviteId);

        return Ok(new { message = "Invite declined" });
    }
}
