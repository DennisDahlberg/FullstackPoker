import { useNavigate } from 'react-router-dom';
import PlayerSeat from '@/components/PlayerSeat';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayingCard from '@/components/PlayingCard';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';

export default function Game() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const loading = useGameStore((s) => s.loading);
  const initGame = useGameStore((s) => s.initGame);
  const playerAction = useGameStore((s) => s.playerAction);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);


  useEffect(() => {
    initGame();    
  }, [initGame]);

    const getCallAmount = () => {
    if (!game) return 0;
    const currentPlayer = game.players[game.currentPlayerIndex];
    return game.highestBet - (currentPlayer?.currentBet || 0);
  };

  const getButtonConfig = (action: string) => {
    switch (action) {
      case 'fold':
        return {
          label: 'Fold',
          className: 'w-24 h-12 bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50 hover:text-red-300',
          onClick: () => playerAction('fold')
        };
      case 'check':
        return {
          label: 'Check',
          className: 'w-24 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white',
          onClick: () => playerAction('check')
        };
      case 'call':
        return {
          label: `Call ($${getCallAmount()})`,
          className: 'w-24 h-12 bg-blue-800/30 border-blue-700 text-blue-400 hover:bg-blue-800/50 hover:text-blue-300',
          onClick: () => playerAction('call')
        };
      case 'raise':
        return {
          label: 'Raise',
          className: 'w-24 h-12 bg-green-800/30 border-green-700 text-green-400 hover:bg-green-800/50 hover:text-green-300',
          onClick: () => setIsRaiseModalOpen(true)
        };
      case 'all-in':
        return {
          label: 'All In',
          className: 'w-24 h-12 bg-purple-800/30 border-purple-700 text-purple-400 hover:bg-purple-800/50 hover:text-purple-300',
          onClick: () => playerAction('all-in')
        };
  }}

  // Loading will be used later for animations and wait for backend to finish
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
          {game.players.map((player, index) => (
            <PlayerSeat 
              key={index} 
              position={index} 
              player={player || undefined} 
              isCurrentPlayer={index === game.currentPlayerIndex}
            />
          ))}
          
        </div>
      </div>

      {/* Actions */}
      <div className=" bg-gray-900 border-t border-gray-800 p-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">          
          
          <div className="flex items-center gap-3">
            {game.availableActions.map((action) => {
            const buttonConfig = getButtonConfig(action);
            return (
                <Button 
                key={action}
                variant="outline" 
                className={buttonConfig?.className}
                onClick={() => buttonConfig?.label !== 'Raise' ? playerAction(action) : setIsRaiseModalOpen(true)} 
                >
                  {buttonConfig?.label}
                </Button>
            );
            })}
          </div>         
        </div>
        {isRaiseModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white">Enter Raise Amount</h2>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}