import { useNavigate } from 'react-router-dom';
import PlayerSeat from '@/components/PlayerSeat';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayingCard from '@/components/PlayingCard';
import { useEffect } from 'react';
// import axios from 'axios';
import { useGameStore } from '@/stores/useGameStore';

export default function Game() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const loading = useGameStore((s) => s.loading);
  const initGame = useGameStore((s) => s.initGame);


  useEffect(() => {
    initGame();    
  }, []);

  
  
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

  const currentBet = 200;

  if (loading || !game) return <div>Loading...</div>

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
                  Pot: ${game.pot.toLocaleString()}
                </span>
              </div>
              
              {/* Community Cards */}
              <div className="flex gap-2 md:gap-3">
                {game.communityCards.map((card, index) => (
                  <PlayingCard key={index} value={`${card.rank}${card.suit}`} hidden={card.isHidden} />
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