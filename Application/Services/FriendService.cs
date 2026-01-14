using Core.DTOs.Friend;
using Core.Models;
using FluentResults;
using Infrastructure.Repositories;
using Mapster;

namespace Application.Services;

public class FriendService
{
    private readonly FriendsRepository _repository;

    public FriendService(FriendsRepository repository)
    {
        _repository = repository;
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
}