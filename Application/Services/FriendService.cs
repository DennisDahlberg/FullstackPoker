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

    public async Task<Result<string>> AcceptFriendRequestAsync(int requestId, string userId)
    {
        var friendRequest = _repository.GetFriendById(requestId, userId);
        
        if (friendRequest == null)
            return Result.Fail("Friend request not found");
        
        if (friendRequest.Status !=  FriendStatus.Pending)
            return Result.Fail("Friend request not pending");
        
        friendRequest.Status = FriendStatus.Accepted;
        await _repository.SaveChangesAsync();

        return Result.Ok(friendRequest.RequesterId);
    }

    public async Task<List<FriendRequestDto>> GetFriendRequestsAsync(string userId)
    {
        var requests = await _repository.GetFriendRequestsAsync(userId);
        var result = requests.Select(r => new FriendRequestDto()
        {
            CreatedAt =  r.CreatedAt,
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
        }).ToList();
        return result;
    }

    public async Task<List<UserSearchResultDto>> FindUsersAsync(string currentUserId, string query)
    {
        var users = _userService.FindUsersAsync(query);
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
                Status = status
            };
        }).ToList();

        return results;
    }
}