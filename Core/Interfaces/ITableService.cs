using Core.DTOs.Table;
using FluentResults;

namespace Core.Interfaces;

public interface ITableService
{
    Task<List<TableDto>> GetTablesAsync();
    Task<Result<TableDto>> GetTableByIdAsync(int id);
}