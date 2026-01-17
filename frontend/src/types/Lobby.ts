export interface BotProfile {
  id: string;
  name: string;
  style: string;
  skill: "Beginner" | "Intermediate" | "Pro" | "Elite";
  image?: string;
  isUserCreated?: boolean;
}

export interface TableConfig {
  id: string;
  name: string;
  description: string;
  buyIn: number;
  bigBlind: number;
  smallBlind: number;
  difficulty: "Casual" | "Standard" | "Hardcore";
}