using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class FriendsRepository
{
    private readonly ApplicationDbContext _dbContext;

    public FriendsRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CreateFriendRequestAsync(Friend model)
    {
        _dbContext.Add(model);
        await _dbContext.SaveChangesAsync();
    }

    public Friend GetFriendById(int id,  string userId)
    {
        var friend = _dbContext.Friends
            .Include(f => f.Addressee)
            .FirstOrDefault(f => f.Id == id && f.AddresseeId == userId);
        return friend;
    }


    public async Task<bool> IsFriendsAsync(string currentUserId, string targetUserId)
    {
        var existingFriendship = await _dbContext.Friends
            .FirstOrDefaultAsync(f => 
                (f.RequesterId == currentUserId && f.AddresseeId == targetUserId) ||
                (f.RequesterId == targetUserId && f.AddresseeId == currentUserId));
        return existingFriendship != null;
    }
    
    public async Task<List<Friend>> GetFriendshipsByUserIdsAsync(string currentUserId, List<string> userIds)
    {
        return await _dbContext.Friends
            .Where(f => 
                (f.RequesterId == currentUserId && userIds.Contains(f.AddresseeId)) ||
                (f.AddresseeId == currentUserId && userIds.Contains(f.RequesterId)))
            .ToListAsync();
    }
}