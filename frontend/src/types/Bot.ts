export type SkillLevel = "Beginner" | "Intermediate" | "Pro" | "Elite";

export interface BotEntry {
  id: number;
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
  isUserCreated: boolean;
}

export interface CreateBotDto {
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
}

export interface UpdateBotDto {
  id: number;
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
}

export type BotTabId = "all" | "mine";
