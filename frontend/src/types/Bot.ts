export type SkillLevel = "Beginner" | "Intermediate" | "Pro" | "Elite";

export interface BotEntry {
  id: number;
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
  isUserCreated: boolean;
}

export type BotTabId = "all" | "mine";
