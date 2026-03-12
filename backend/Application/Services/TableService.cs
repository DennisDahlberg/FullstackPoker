using Core.DTOs.Table;
using Core.Interfaces;
using FluentResults;
using Mapster;

namespace Application.Services;

public class TableService : ITableService
{
    private readonly ITableRepository _repository;

    public TableService(ITableRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TableDto>> GetTablesAsync()
    {
        var tables = await _repository.GetAllAsync();
        return tables.Adapt<List<TableDto>>();
    }

    public async Task<Result<TableDto>> GetTableByIdAsync(int id)
    {
        var result = await _repository.GetTableByIdAsync(id);
        if (result == null)
            return Result.Fail("No table found");
        return result.Adapt<TableDto>();
    }
    
}