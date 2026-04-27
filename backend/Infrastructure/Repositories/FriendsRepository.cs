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

    public async Task<List<Friend>> GetFriendRequestsAsync(string userId)
    {
        var requests = await _dbContext.Friends
            .Include(f => f.Requester)
            .Where(f => f.AddresseeId == userId && f.Status == FriendStatus.Pending)
            .ToListAsync();
        return  requests;
    }

    public async Task<List<Friend>> GetFriendsAsync(string userId)
    {
        var friends = await _dbContext.Friends
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendStatus.Accepted)
            .Include(f => f.Addressee)
            .Include(f => f.Requester)
            .ToListAsync();
        return friends;
    }

    public async Task<bool> IsFriendsAsync(string currentUserId, string targetUserId)
    {
        var existingFriendship = await _dbContext.Friends
            .FirstOrDefaultAsync(f => 
                (f.RequesterId == currentUserId && f.AddresseeId == targetUserId) ||
                (f.RequesterId == targetUserId && f.AddresseeId == currentUserId));
        if (existingFriendship is null)
            return false;
        
        return existingFriendship.Status != FriendStatus.Rejected;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
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