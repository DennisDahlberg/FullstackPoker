namespace Core.GameModels
{
    public class Player
    {
        public string Name { get; set; } = null!;
        public List<PlayerCard> Hand { get; set; } = [];
        public int GameStartingChips { get; set; }
        public int RoundStartingChips { get; set; }
        public int StartingRankPoints { get; set; }
        public int RankPoints { get; set; }
        public int Chips { get; set; }
        public int CurrentBet { get; set; }
        public bool IsFolded { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsPlayer { get; set; }
        public bool IsDealer { get; set; } = false;
        public bool HasActedThisRound { get; set; } = false;
        public string? LastAction { get; set; }
        public int? LastActionAmount { get; set; }
        public string? Comment { get; set; }
        public string? UserId { get; set; }
        public int SeatNumber { get; set; }
        public int Rebuys { get; set; }
        
        public string Description { get; set; } = null!;
        public string PlayStyle { get; set; } = null!;
        public string SkillLevel { get; set; } = null!;
        public string? ProfileImageUrl { get; set; }
        public string BestHand { get; set; } = null!;
        public bool IsAwaitingRebuy { get; set; } = false;
    }
}
