import { create } from "zustand";
import type { GameState } from "@/types/GameState";
// import type { GameActionPayload } from "@/types/GameState";

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

    const res = await fetch("http://localhost:5132/game/start"); 
    const data = await res.json();

    console.log("Initialized game:", data);

    set({
      game: data,
      loading: false
    });
  }
}));
