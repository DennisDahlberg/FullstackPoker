import { create } from "zustand";
import type { GameState } from "@/types/GameState";
import { api } from "@/lib/api";

interface GameStore {
  game: GameState | null;
  loading: boolean;

  initGame: () => Promise<void>;
  animating: boolean;
  setAnimating: (v: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  loading: false,

  animating: false,
  setAnimating: (v) => set({ animating: v }),

  initGame: async () => {
    set({ loading: true });

    const data = await api.game.initGame();

    console.log("Initialized game:", data);

    set({
      game: data,
      loading: false
    });
  }
}));
