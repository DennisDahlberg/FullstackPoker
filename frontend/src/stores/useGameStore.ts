import { create } from "zustand";
import type { GameState } from "@/types/GameState";
import { api } from "@/lib/api";
import type { GameActionPayload } from "@/types/GameState";

interface GameStore {
  game: GameState | null;
  loading: boolean;

  initGame: () => Promise<void>;
  animating: boolean;
  setAnimating: (v: boolean) => void;
  playerAction: (action: string, payload?: GameActionPayload) => Promise<void>;
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
  },

  playerAction: async (action, payload) => {
    set({ loading: true });

    const state = useGameStore.getState();
    const currentPlayer = state.game?.players[state.game.currentPlayerIndex];

    if (currentPlayer && !currentPlayer.isPlayer) {
      const data = await api.game.botAction();

      set({
        game: data,
        loading: false
      });
      return;
    }

    
    const data = await api.game.playerAction(action, payload);

    set({
      game: data,
      loading: false
    });
  }
}));
