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
    isActive: boolean;
    isDealer: boolean;
    lastAction?: string;
    lastActionAmount?: number;
    userId?: string | null;
}

export interface GameState {
    players: Player[];
    communityCards: Card[];
    deck: Card[];
    pot: number;
    stage: string;
    availableActions: string[];
    bigBlind: number;
    smallBlind: number;
    dealerPosition: number;
    smallBlindPosition: number;
    bigBlindPosition: number;
    currentPlayerIndex: number;
    highestBet: number;
    isGameOver: boolean;
    winnersPositions: number[];
    penaltyAmount: number;
    earlyLeavePayout: number;
    currentViewerUserId?: string | null;
}

export type GameActionPayload = 
    | { amount: number }  
    | undefined               