using Infrastructure.Data;

namespace Infrastructure.Repositories;

public class FriendsRepository
{
    private readonly ApplicationDbContext _dbContext;

    public FriendsRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void CreateFriendRequest()
    {
        
    }
}