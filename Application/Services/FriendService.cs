using Infrastructure.Repositories;

namespace Application.Services;

public class FriendService
{
    private readonly FriendsRepository _repository;

    public FriendService(FriendsRepository repository)
    {
        _repository = repository;
    }

    public void CreateFriendRequest()
    {
        
    }
}