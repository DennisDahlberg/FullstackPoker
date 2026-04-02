namespace Core.GameModels
{
    public class PlayerActionRequest
    {
        public string Action { get; set; } = string.Empty;
        public int? Amount { get; set; }
        public string? Comment { get; set; }
    }
}
