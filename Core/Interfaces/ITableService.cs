using Core.DTOs.Table;

namespace Core.Interfaces;

public interface ITableService
{
    Task<List<TableDto>> GetTablesAsync();
}