import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Card({ value, hidden = false }: { value?: string; hidden?: boolean }) {
  return (
    <div className={`
      w-10 h-14 md:w-12 md:h-16 rounded-lg flex items-center justify-center text-sm font-bold
      ${hidden 
        ? 'bg-blue-800 border-2 border-blue-700' 
        : 'bg-white text-gray-900 border-2 border-gray-300'
      }
    `}>
      {!hidden && value}
    </div>
  );
}

function PlayerSeat({ 
  position, 
  player 
}: { 
  position: number; 
  player?: { name: string; chips: number; cards?: string[]; isActive?: boolean; isTurn?: boolean } 
}) {
  const positions: Record<number, string> = {
    0: 'bottom-3 left-1/2 -translate-x-1/2',           
    1: 'bottom-13 left-4 md:left-16',                 
    2: 'top-1/2 -translate-y-1/2 left-2 md:left-8',   
    3: 'top-16 left-4 md:left-16',                 
    4: 'top-4 left-1/2 -translate-x-1/2',            
    5: 'top-16 right-4 md:right-16',                
    6: 'top-1/2 -translate-y-1/2 right-2 md:right-8',  
    7: 'bottom-13 right-4 md:right-16',                
  };

  const isEmpty = !player;

  return (
    <div className={`absolute ${positions[position]} z-10`}>
      <div className={`
        flex flex-col items-center gap-1 p-2 rounded-xl min-w-[80px] md:min-w-[100px]
        ${isEmpty 
          ? 'border-2 border-dashed border-gray-700 bg-gray-900/50' 
          : player?.isTurn 
            ? 'bg-amber-900/80 border-2 border-amber-500 shadow-lg shadow-amber-500/30' 
            : 'bg-gray-900/90 border border-gray-700'
        }
      `}>
        {isEmpty ? (
          <span className="text-gray-600 text-xs">Empty Seat</span>
        ) : (
          <>
            {/* Player Cards */}
            <div className="flex gap-1 -mt-6">
              <Card hidden={position !== 0} value={player?.cards?.[0]} />
              <Card hidden={position !== 0} value={player?.cards?.[1]} />
            </div>
            
            {/* Player Info */}
            <div className="flex flex-col items-center">
              <span className="text-white text-xs md:text-sm font-medium truncate max-w-[80px]">
                {player?.name}
              </span>
              <span className="text-amber-400 text-xs font-bold">
                ${player?.chips.toLocaleString()}
              </span>
            </div>
            
            {/* Dealer/Action indicator */}
            {player?.isActive && (
              <div className="absolute -top-4 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black">
                D
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();
  
  const mockPlayers = [
    { name: 'You', chips: 5000, cards: ['A♠', 'K♠'], isTurn: true },
    { name: 'Player 2', chips: 3200, cards: ['??', '??'] },
    { name: 'Player 3', chips: 8100, cards: ['??', '??'], isActive: true },
    null, 
    { name: 'Player 5', chips: 2400, cards: ['??', '??'] },
    null, 
    { name: 'Player 7', chips: 6800, cards: ['??', '??'] },
    { name: 'Player 8', chips: 4100, cards: ['??', '??'] },
  ];

  const communityCards = ['10♥', 'J♥', 'Q♥', '?', '?'];
  const pot = 1250;
  const currentBet = 200;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      
      {/* Header */}
      <div className="h-14 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-amber-500 font-bold text-lg">Table #1</h1>
          <span className="text-gray-400 text-sm">No Limit Hold'em</span>
          <span className="text-gray-500 text-sm">Blinds: $10/$20</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={() => navigate('/dashboard')}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* Poker Table */}
        <div className="absolute inset-8 md:inset-16 lg:inset-24 max-w-5xl mx-auto">
          
          {/* Table Surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-800 to-green-900 rounded-[50%] border-8 border-amber-900 shadow-2xl">
            
            {/* Table felt texture overlay */}
            <div className="absolute inset-0 rounded-[50%] opacity-30 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              
              {/* Pot */}
              <div className="bg-black/40 px-6 py-2 rounded-full">
                <span className="text-amber-400 font-bold text-lg md:text-xl">
                  Pot: ${pot.toLocaleString()}
                </span>
              </div>
              
              {/* Community Cards */}
              <div className="flex gap-2 md:gap-3">
                {communityCards.map((card, index) => (
                  <div 
                    key={index} 
                    className={`
                      w-12 h-16 md:w-14 md:h-20 rounded-lg flex items-center justify-center 
                      text-lg md:text-xl font-bold shadow-lg
                      ${card === '?' 
                        ? 'bg-gray-800 border-2 border-gray-700 text-gray-600' 
                        : 'bg-white text-gray-900 border-2 border-gray-300'
                      }
                    `}
                  >
                    {card}
                  </div>
                ))}
              </div>
              
            </div>
          </div>
          
          {/* Player Seats */}
          {mockPlayers.map((player, index) => (
            <PlayerSeat 
              key={index} 
              position={index} 
              player={player || undefined} 
            />
          ))}
          
        </div>
      </div>

      {/* Action Bar */}
      <div className=" bg-gray-900 border-t border-gray-800 p-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">          
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="w-24 h-12 bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50 hover:text-red-300"
            >
              Fold
            </Button>
            
            <Button 
              variant="outline" 
              className="w-24 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Check
            </Button>
            
            <Button 
              variant="outline" 
              className="w-24 h-12 bg-green-900/30 border-green-700 text-green-400 hover:bg-green-900/50 hover:text-green-300"
            >
              Call ${currentBet}
            </Button>
          </div>         
        </div>
      </div>
      
    </div>
  );
}