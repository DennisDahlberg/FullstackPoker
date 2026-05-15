using Core.Interfaces;
using Core.Models;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly ApplicationDbContext _context;

    public ChatRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SaveChatMessageAsync(ChatMessage message)
    {
        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ChatMessage>> GetMessagesBetweenUsersAsync(string userId, string friendId)
    {
        return await _context.ChatMessages
            .Include(m => m.Sender)
            .Where(m => 
                (m.SenderId == userId && m.RecipientId == friendId) ||
                (m.SenderId == friendId && m.RecipientId == userId))
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    public async Task<List<string>> GetConversationUserIdsAsync(string userId)
    {
        var senderIds = await _context.ChatMessages
            .Where(m => m.RecipientId == userId)
            .Select(m => m.SenderId)
            .Distinct()
            .ToListAsync();

        var recipientIds = await _context.ChatMessages
            .Where(m => m.SenderId == userId)
            .Select(m => m.RecipientId)
            .Distinct()
            .ToListAsync();

        return senderIds.Union(recipientIds).Distinct().ToList();
    }

    public async Task<int> GetUnreadCountAsync(string userId, string friendId)
    {
        return await _context.ChatMessages
            .Where(m => m.SenderId == friendId && m.RecipientId == userId && !m.IsRead)
            .CountAsync();
    }
}