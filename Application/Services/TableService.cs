using Core.DTOs.Table;
using Core.Interfaces;
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
    
}