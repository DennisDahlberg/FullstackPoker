namespace Core.GameModels
{
    public enum GameStage
    {
        PreFlop,
        Flop,
        Turn,
        River,
        Showdown
    }

    public class GameState
    {
        public List<Player> Players { get; set; } = [];
        public int CurrentPlayerIndex { get; set; }
        public List<PlayerCard> CommunityCards { get; set; } = [];
        public List<PlayerCard> Deck { get; set; } = [];
        public int Pot { get; set; }
        public GameStage Stage { get; set; } = GameStage.PreFlop;
        public List<string> AvailableActions { get; set; } = [];
        public int BigBlind { get; set; }
        public int SmallBlind { get; set; }
        public int DealerPosition { get; set; }
        public int SmallBlindPosition { get; set; }
        public int BigBlindPosition { get; set; }
        public int HighestBet { get; set; } = 0;
        public bool IsGameOver { get; set; }
        public bool IsFirstRound { get; set; } = true;
        public List<int> WinnersPositions { get; set; } = [];
        public int TableId { get; set; }
        public DateTimeOffset StartedAt { get; set; }
        public int EarlyLeavePayout { get; set; }
    }
}
