using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Table = Core.Models.Table;

namespace Infrastructure.Repositories;

public class TableRepository
{
    private readonly ApplicationDbContext _context;

    public TableRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Table>> GetAllAsync()
    {
        var tables = await _context.Tables.ToListAsync();
        return tables;
    }
    
}