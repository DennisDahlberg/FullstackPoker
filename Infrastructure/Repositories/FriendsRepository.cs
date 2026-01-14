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
        await _dbContext.Friends.AddAsync(model);
        await _dbContext.SaveChangesAsync();
    }


    public async Task<bool> IsFriendsAsync(ApplicationUser currentUser, ApplicationUser targetUser)
    {
        var existingFriendship = await _dbContext.Friends
            .FirstOrDefaultAsync(f => 
                (f.RequesterId == currentUser.Id && f.AddresseeId == targetUser.Id) ||
                (f.RequesterId == targetUser.Id && f.AddresseeId == currentUser.Id));
        return existingFriendship != null;
    }
}