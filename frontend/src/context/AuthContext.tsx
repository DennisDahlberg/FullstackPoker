import { createContext, useContext } from "react";

export interface ContextData {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    rank: string;
    balance?: number;
    profileImageUrl?: string;
  } | null;
}

export interface LoginBonusData {
  wasAwarded: boolean;
  bonusAmount: number;
  currentStreak: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  loginBonus?: LoginBonusData;
}

export interface AuthContextType {
  data: ContextData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refetch: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
