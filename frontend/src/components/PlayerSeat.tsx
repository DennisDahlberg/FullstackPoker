import PlayingCard from "./PlayingCard";
import type {Player} from "@/types/GameState";

export default function PlayerSeat({ 
  position, 
  player, 
  isCurrentPlayer
}: { 
  position: number; 
  player: Player;
  isCurrentPlayer: boolean;
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

  const actionMessage: Record<string, (amount?: number) => {message: string, className: string}> = {
    fold: () => ({ message: "Folded", className: "text-red-400" }),
    check: () => ({ message: "Checked", className: "text-blue-400" }),
    call: (amount) => ({ message: `Called $${amount}`, className: "text-green-400" }),
    bet: (amount) => ({ message: `Bet $${amount}`, className: "text-yellow-400" }),
    raise: (amount) => ({ message: `Raised $${amount}`, className: "text-purple-400" }),
    small: () => ({ message: "Small Blind", className: "text-gray-200" }),
    big: () => ({ message: "Big Blind", className: "text-gray-200" }),
  }

  const getActionMessage = (action?: string, amount?: number) => {
    if (!action) return { message: "", className: "" };
    const fn = actionMessage[action];
    return fn ? fn(amount) : { message: action + (amount ? ` ${amount}` : ""), className: "" };
  };

  const isEmpty = !player;

  console.log(player);

  return (
    <div className={`absolute ${positions[position]} z-10 ${player.isFolded ? 'opacity-50 grayscale' : ''}`}>
      {isEmpty ? (
        <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center text-gray-600">
          <span>Empty</span>
        </div>
      ) : (
      <div className={`relative flex flex-col`}>
        <div className='flex flex-col items-center z-10 bg-gray-900 rounded text-sm w-35'>
          <span className='w-full text-center border-b border-gray-700'>{player?.name}</span>
          <span className='self-end pr-2'>${player?.chips.toLocaleString()}</span>
        </div>
        <img src="/images/players/placeholder_robot.jpg" className={`z-15 absolute -left-12 -bottom-3 h-16 w-16 rounded-full object-cover border-4 ${isCurrentPlayer ? 'border-yellow-400' : 'border-gray-700'}`} alt="" />
        {player?.hand && (
          <div className='absolute bottom-7 left-1 z-5 flex gap-1'>
            <PlayingCard hidden={player.hand[0].isHidden} value={`${player.hand[0].rank}${player.hand[0].suit}`} />
            <PlayingCard hidden={player.hand[1].isHidden} value={`${player.hand[1].rank}${player.hand[1].suit}`} />
          </div>
        )}
        {player.isDealer && (
          <div className='absolute -top-3 -left-13 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-gray-900 z-20'>
            D
          </div>
        )}
        <span className={`absolute -bottom-7 bg-gray-900 w-full rounded text-md text-center ${getActionMessage(player.lastAction, player.lastActionAmount).className}`}>
          {getActionMessage(player.lastAction, player.lastActionAmount).message}
        </span>
      </div>
      )}
    </div>
  );
}