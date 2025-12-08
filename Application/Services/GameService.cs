using Core.GameModels;

namespace Application.Services
{
    public class GameService
    {
        private static readonly Random _random = new Random();

        public GameState InitializeGame()
        {
            var gameState = new GameState();

            gameState.Players.Add(new Player { Name = "Dennis" });
            gameState.Players.Add(new Player { Name = "Albert" });
            gameState.Players.Add(new Player { Name = "Otto" });

            gameState.Deck = InitializeDeck();
            foreach (var player in gameState.Players)
                GetStartingHand(player, gameState.Deck);
            GetCommunityCards(gameState);

            return gameState;
        }

        public void GetStartingHand(Player player, List<Card> deck)
        {
            player.Hand.Add(DrawCard(deck));
            player.Hand.Add(DrawCard(deck));
            if (player.IsPlayer is true)
            {
                player.Hand[0].IsHidden = false;
                player.Hand[1].IsHidden = false;
            }
        }

        public void GetCommunityCards(GameState state)
        {
            state.CommunityCards.Add(DrawCard(state.Deck));
            state.CommunityCards.Add(DrawCard(state.Deck));
            state.CommunityCards.Add(DrawCard(state.Deck));
            state.CommunityCards[0].IsHidden = false;
            state.CommunityCards[1].IsHidden = false;
            state.CommunityCards[2].IsHidden = false;
            state.CommunityCards.Add(DrawCard(state.Deck));
            state.CommunityCards.Add(DrawCard(state.Deck));
        }

        public List<Card> InitializeDeck()
        {
            var cards = new List<Card>();

            var ranks = new List<string> { "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" };
            var suits = new List<string> { "H", "D", "S", "C" };

            foreach (var rank in ranks)
            {
                foreach (var suit in suits)
                {
                    cards.Add(new Card { Rank = rank, Suit = suit, IsHidden = true });
                }
            }
            return cards;
        }

        public Card DrawCard(List<Card> deck)
        {
            var index = _random.Next(deck.Count);
            var card = deck[index];
            deck.RemoveAt(index);
            return card;
        }
    }
}
