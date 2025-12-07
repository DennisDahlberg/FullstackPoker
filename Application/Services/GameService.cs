using Core.GameModels;

namespace Application.Services
{
    public class GameService
    {
        private static readonly Random _random = new Random();

        public void InitializeGame()
        {
            var gameState = new GameState();
            var deck = InitializeDeck();
            foreach (var player in gameState.Players)
                GetStartingHand(player, deck);
        }

        public void GetStartingHand(Player player, List<Card> deck)
        {
            DrawCard(deck, player);
            DrawCard(deck, player);
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

        public void DrawCard(List<Card> deck, Player player)
        {
            var index = _random.Next(deck.Count);
            var card = deck[index];
            if (player.IsPlayer is true)
                card.IsHidden = false;
            player.Hand.Add(card);
            deck.RemoveAt(index);
        }
    }
}
