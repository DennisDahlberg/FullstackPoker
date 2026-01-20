namespace Core.DTOs.Table;

public class TableDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int BuyIn { get; set; }
    public int SmallBlind { get; set; }
    public int BigBlind { get; set; }
    public string Difficulty { get; set; } = null!;
}