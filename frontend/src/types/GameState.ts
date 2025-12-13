export default interface Card {
    suit: string;
    rank: string;
    isHidden: boolean;
}

export interface Player { 
    name: string;
    chips: number;
    currentBet: number;
    hand: Card[];
    isFolded: boolean;
    isPlayer: boolean;
}

export interface GameState {
    players: Player[];
    communityCards: Card[];
    deck: Card[];
    pot: number;
    stage: string;
    availableActions: string[];
    curreentPlayerIndex: number;
}

export type GameActionPayload = 
    | { amount: number }  
    | undefined               