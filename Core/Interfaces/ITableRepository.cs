using Core.Models;

namespace Core.Interfaces;

public interface ITableRepository
{
    Task<List<Table>> GetAllAsync();
    Task<Table?> GetTableByIdAsync(int id);
}