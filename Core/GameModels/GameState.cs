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
        public List<Card> CommunityCards { get; set; } = [];
        public List<Card> Deck { get; set; } = [];
        public int Pot { get; set; }
        public GameStage Stage { get; set; } = GameStage.PreFlop;
        public List<string> AvailableActions { get; set; } = [];        
        public int BigBlind { get; set; } = 20;
        public int SmallBlind { get; set; } = 10;
        public int DealerPosition { get; set; } = 0;
        public int SmallBlindPosition { get; set; } = 1;
        public int BigBlindPosition { get; set; } = 2;
        public int CurrentPlayerPosition { get; set; } = 3;
    }
}
