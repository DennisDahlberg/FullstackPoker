export interface GameState {
    pot: number
}

export type GameActionPayload = 
    | { amount: number }  
    | undefined               