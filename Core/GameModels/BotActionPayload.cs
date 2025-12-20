using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.GameModels
{
    public class BotActionPayload
    {
        public Player Bot { get; set; } = null!;
        public int HighestBet { get; set; }
        public List<Card> CommunityCards { get; set; } = [];
        public int Pot { get; set; }
        public GameStage Stage { get; set; }
        public int PlayersLeft{ get; set; }
    }
}
