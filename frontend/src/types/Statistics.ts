export interface Summary {
    totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  biggestWin: number;
  currentStreak: number;
  profitHistory: ChartDataPoint[];
}

export interface ChartDataPoint {
  date: string;
  profit: number;
  cumulative: number;
}

export type GameResult = "win" | "loss";

export interface PastGame {
  id: string;
  date: string;
  players: number;
  buyIn: number;
  result: GameResult;
  profit: number;
  duration: string;
  bestHand: string;
  chipsPostGame: number;  
}