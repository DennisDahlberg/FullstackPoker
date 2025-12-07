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
        public List<Card> CommunityCards { get; set; } = [];
        public int Pot { get; set; }
        public GameStage Stage { get; set; } = GameStage.PreFlop;
    }
}
