export type SkillLevel = "Beginner" | "Intermediate" | "Pro" | "Elite";

export interface BotEntry {
  id: number;
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
  isUserCreated: boolean;
  profileImageUrl?: string;
}

export interface CreateBotDto {
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
  profileImage?: File | null;
}

export interface UpdateBotDto {
  id: number;
  username: string;
  description: string;
  playStyle: string;
  skillLevel: SkillLevel;
  profileImage?: File | null;
}

export type BotTabId = "all" | "mine";
