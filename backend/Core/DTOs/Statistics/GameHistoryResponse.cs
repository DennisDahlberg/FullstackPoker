namespace Core.DTOs.Statistics;

public class GameHistoryResponse
{
    public List<GameHistoryItemDto> Games { get; set; } = [];
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public bool HasMore { get; set; }
}