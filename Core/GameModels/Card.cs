namespace Core.GameModels
{
    public class Card
    {
        public string Rank { get; set; } = null!;
        public string Suit { get; set; } = null!;

        public override string ToString()
        {
            return $"{Rank}{Suit}";
        }
    }
}
