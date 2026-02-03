namespace Core.GameModels
{
    public class Player
    {
        public string Name { get; set; } = null!;
        public List<PlayerCard> Hand { get; set; } = [];
        public int Chips { get; set; }
        public int CurrentBet { get; set; }
        public bool IsFolded { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsPlayer { get; set; }
        public bool IsDealer { get; set; } = false;
        public bool HasActedThisRound { get; set; } = false;
        public string? LastAction { get; set; }
        public int? LastActionAmount { get; set; }
        public string? UserId { get; set; }
    }
}
