namespace Core.GameModels
{
    public class Player
    {
        public string Name { get; set; } = null!;
        public List<Card> Hand { get; set; } = [];
        public int Chips { get; set; }
        public int CurrentBet { get; set; }
        public bool IsFolded { get; set; }
        public bool IsPlayer { get; set; }
    }
}
