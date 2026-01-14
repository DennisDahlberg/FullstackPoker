using Core.DTOs.Friend;
using Core.Models;
using FluentResults;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Mapster;

namespace Application.Services;

public class FriendService
{
    private readonly FriendsRepository _repository;
    private readonly UserService _userService;

    public FriendService(FriendsRepository repository, UserService userService)
    {
        _repository = repository;
        _userService = userService;
    }

    public async Task<Result> CreateFriendRequest(CreateFriendRequestDTO request)
    {
        var isAlreadyFriends = await _repository
            .IsFriendsAsync(request.Requester, request.Addressee);
        if (isAlreadyFriends)
            return Result.Fail("Already Friends");

        request.CreatedAt = DateTime.UtcNow;
        request.Status = FriendStatus.Pending;
        var friend = request.Adapt<Friend>();
        await _repository.CreateFriendRequestAsync(friend);
        
        return Result.Ok();
    }

    public async Task<List<UserSearchResultDto>> FindUsersAsync(string query)
    {
        var users = _userService.FindUsersAsync(query);
        if (!users.Any())
            return new List<UserSearchResultDto>();

        return new List<UserSearchResultDto>();
    }
}