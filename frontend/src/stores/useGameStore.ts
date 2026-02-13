import { create } from "zustand";
import type { GameState } from "@/types/GameState";
import { api } from "@/lib/api";
import type { GameActionPayload } from "@/types/GameState";

interface GameStore {
  game: GameState | null;
  loading: boolean;

  getGame: () => Promise<void>;
  animating: boolean;
  setAnimating: (v: boolean) => void;
  playerAction: (action: string, payload?: GameActionPayload) => Promise<void>;
  botAction: () => Promise<void>;
  startNewRound: () => Promise<void>;
  leaveGame: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  loading: false,

  animating: false,
  setAnimating: (v) => set({ animating: v }),

  getGame: async () => {
    set({ loading: true });

    const data = await api.game.getGameData();

    set({
      game: data,
      loading: false
    });

    if (data?.players[data.currentPlayerIndex]?.isPlayer === false) {
      await useGameStore.getState().botAction();
    }
  },

  playerAction: async (action, payload) => {
    set({ loading: true });

    const state = useGameStore.getState();

    const data = await api.game.playerAction(action, payload);    

    set({
      game: data,
      loading: false
    });

    if (state.game?.players[data.currentPlayerIndex]?.isPlayer === false) {
      await useGameStore.getState().botAction();
    }      
  },

  botAction: async () => {
    let state = useGameStore.getState();

    while (
      state.game &&
      !state.game.isGameOver &&
      state.game?.players[state.game.currentPlayerIndex]?.isPlayer === false
    ) {
      set({ loading: true });

      const data = await api.game.botAction();
      set({ game: data, loading: false });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      state = useGameStore.getState();
    }
  },

  startNewRound: async () => {
    set({ loading: true });

    const state = useGameStore.getState();
    const data = await api.game.startNewRound();

    set({
      game: data,
      loading: false
    });

    if (state.game?.players[data.currentPlayerIndex]?.isPlayer === false) {
      await useGameStore.getState().botAction();
    }
  },
  
  leaveGame: async () => {
    set({ loading: true });

    await api.game.leaveGame();

    set({
      game: null,
      loading: false
    });
  }
}));
