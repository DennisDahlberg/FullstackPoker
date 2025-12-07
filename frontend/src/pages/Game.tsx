import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayingCard from '@/components/PlayingCard';

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

  // const isEmpty = !player;

  return (
    <div className={`absolute ${positions[position]} z-10`}>
      <div className={`relative flex flex-col`}>
        <div className='flex flex-col items-center z-10 bg-gray-900 rounded text-sm w-35'>
          <span className='w-full text-center border-b border-gray-700'>{player?.name}</span>
          <span className='self-end pr-2'>${player?.chips.toLocaleString()}</span>
        </div>
        <img src="/images/players/placeholder_robot.jpg" className='z-15 absolute -left-12 -bottom-3 h-16 w-16 rounded-full object-cover border-4 border-gray-700' alt="" />
        {player?.cards && (
          <div className='absolute bottom-7 left-1 z-5 flex gap-1'>
            <PlayingCard hidden={position !== 0} value={player.cards[0]} />
            <PlayingCard hidden={position !== 0} value={player.cards[1]} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();
  
  const mockPlayers = [
    { name: 'You', chips: 5000, cards: ['AS', 'KS'], isTurn: true },
    { name: 'Player 2', chips: 3200, cards: ['??', '??'] },
    { name: 'Player 3', chips: 8100, cards: ['??', '??'], isActive: true },
    null, 
    { name: 'Player 5', chips: 2400, cards: ['??', '??'] },
    null, 
    { name: 'Player 7', chips: 6800, cards: ['??', '??'] },
    { name: 'Player 8', chips: 4100, cards: ['??', '??'] },
  ];

  const communityCards = ['10H', 'JH', 'QH', '?', '?'];
  const pot = 1250;
  const currentBet = 200;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      
      {/* Header */}
      <div className="h-14 bg-gray-900/80 border-b border-gray-800 flex items-center justify-end px-4">        
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
                  <PlayingCard key={index} value={card} hidden={card === '?'} />
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