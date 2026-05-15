using Core.DTOs.Friend;
using Core.Interfaces;
using Core.Models;
using FluentResults;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Mapster;

namespace Application.Services;

public class FriendService
{
    private readonly FriendsRepository _repository;
    private readonly IUserService _userService;

    public FriendService(FriendsRepository repository, IUserService userService)
    {
        _repository = repository;
        _userService = userService;
    }

    public async Task<Result> CreateFriendRequest(CreateFriendRequestDTO request)
    {
        var isAlreadyFriends = await _repository
            .IsFriendsAsync(request.RequesteId, request.AddresseeId);
        if (isAlreadyFriends)
            return Result.Fail("Already Friends");
        
        var friend = new Friend
        {
            AddresseeId =  request.AddresseeId,
            RequesterId = request.RequesteId,
            CreatedAt = DateTime.UtcNow,
            Status =  FriendStatus.Pending
        };
        await _repository.CreateFriendRequestAsync(friend);

        return Result.Ok();
    }

    public async Task<Result<string>> HandleFriendRequestAsync(int requestId, string userId, bool accept)
    {
        var friendRequest = _repository.GetFriendById(requestId, userId);
        
        if (friendRequest == null)
            return Result.Fail("Friend request not found");
        
        if (friendRequest.Status !=  FriendStatus.Pending)
            return Result.Fail("Friend request not pending");
        
        friendRequest.Status = accept ? FriendStatus.Accepted : FriendStatus.Rejected;
        
        await _repository.SaveChangesAsync();

        return Result.Ok(friendRequest.RequesterId);
    }

    public async Task<Result<string>> RemoveFriendAsync(string userId, string friendUserId)
    {
        var friend = await _repository.GetFriendByIdsAsync(userId, friendUserId);
        
        if (friend is null)
            return Result.Fail("Friend not found");
        
        if (friend.Status !=  FriendStatus.Accepted)
            return Result.Fail("Friend not found");
        
        friend.Status = FriendStatus.Rejected;
        await _repository.SaveChangesAsync();
        
        return Result.Ok(friend.RequesterId);
    }

    public async Task<List<FriendRequestDto>> GetFriendRequestsAsync(string userId)
    {
        var requests = await _repository.GetFriendRequestsAsync(userId);
        var result = requests.Select(r => new FriendRequestDto()
        {
            Id = r.Id,
            SentAt =  r.CreatedAt,
            Username = r.Requester.UserName,
        }).ToList();
        return result;
    }

    public async Task<List<FriendDto>> GetFriendsAsync(string userId)
    {
        var currentUser = await _userService.GetUserById(userId); 
        var friends =  await _repository.GetFriendsAsync(userId);
        var result = friends.Select(f => new FriendDto()
        {
            Username = f.Addressee.UserName != currentUser.UserName ? f.Addressee.UserName : f.Requester.UserName,
            Id = f.AddresseeId != currentUser.Id ? f.AddresseeId : f.RequesterId,
            ProfileImageUrl = f.AddresseeId != currentUser.Id ? f.Addressee.ProfileImageUrl : f.Requester.ProfileImageUrl,
        }).ToList();
        return result;
    }

    public async Task<List<UserSearchResultDto>> FindUsersAsync(string currentUserId, string query)
    {
        var users = _userService.FindUsersAsync(query, currentUserId);
        if (!users.Any())
            return new List<UserSearchResultDto>();
        
        var userIds = users.Select(u => u.Id).ToList();
        var friendships = await _repository.GetFriendshipsByUserIdsAsync(currentUserId, userIds);
        
        var results = users.Select(user =>
        {
            var friendship = friendships.FirstOrDefault(f =>
                (f.RequesterId == currentUserId && f.AddresseeId == user.Id) ||
                (f.AddresseeId == currentUserId && f.RequesterId == user.Id));

            string status = "none";
            if (friendship != null)
            {
                if (friendship.Status == FriendStatus.Accepted)
                    status = "friend";
                else if (friendship.Status == FriendStatus.Pending)
                {
                    status = "pending";
                }
            }

            return new UserSearchResultDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Status = status,
                ProfileImageUrl = user.ProfileImageUrl,
            };
        }).ToList();

        return results;
    }
}