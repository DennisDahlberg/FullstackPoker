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
        public int CurrentPlayerIndex { get; set; } = 0;
        public List<PlayerCard> CommunityCards { get; set; } = [];
        public List<PlayerCard> Deck { get; set; } = [];
        public int Pot { get; set; }
        public GameStage Stage { get; set; } = GameStage.PreFlop;
        public List<string> AvailableActions { get; set; } = [];
        public int BigBlind { get; set; }
        public int SmallBlind { get; set; }
        public int DealerPosition { get; set; } = 3;
        public int SmallBlindPosition { get; set; } = 4;
        public int BigBlindPosition { get; set; } = 5;
        public int LastAggressorIndex { get; set; }
        public int CurrentPlayerPosition { get; set; } = 0;
        public int HighestBet { get; set; } = 0;
        public bool IsGameOver { get; set; }
        public List<int> WinnersPositions { get; set; } = [];
    }
}
