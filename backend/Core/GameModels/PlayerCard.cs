namespace Core.GameModels
{
    public class PlayerCard
    {
        public string Rank { get; set; } = null!;
        public string Suit { get; set; } = null!;
        public bool IsHidden { get; set; }

        public override string ToString()
        {
            return $"{Rank}{Suit}";
        }
    }
}
