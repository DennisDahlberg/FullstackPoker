import { create } from "zustand";
import * as signalR from "@microsoft/signalr";
import type { GameState } from "@/types/GameState";
import type { GameActionPayload } from "@/types/GameState";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface GameStore {
  game: GameState | null;
  loading: boolean;
  animating: boolean;
  connection: signalR.HubConnection | null;
  error: string | null;

  connectToGame: () => Promise<void>;
  disconnectFromGame: () => Promise<void>;

  getGame: () => Promise<void>;
  setAnimating: (v: boolean) => void;
  playerAction: (action: string, payload?: GameActionPayload) => Promise<void>;
  botAction: () => Promise<void>;
  startNewRound: () => Promise<void>;
  leaveGame: () => Promise<void>;

  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  loading: false,
  connection: null,
  error: null,
  animating: false,

  setAnimating: (v) => set({ animating: v }),
  clearError: () => set({ error: null }),

  connectToGame: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_BACKEND_URL}/hubs/game`, {
          accessTokenFactory: () => token ?? "",
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connection.on("GameStateUpdated", (gameState: GameState) => {
        set({ game: gameState, loading: false, animating: false });
      });

      connection.on("PlayerConnected", (playerName: string) => {
        toast.info(`${playerName} joined the table`);
      });

      connection.on("PlayerDisconnected", (playerName: string) => {
        toast.info(`${playerName} left the table`);
      });

      connection.on("Error", (message: string) => {
        toast.error(message);
        set({ error: message, loading: false, animating: false });
      });

      connection.onreconnecting((error) => {
        console.warn("Reconnecting...", error);
        toast.warning("Connection lost. Reconnecting...");
        set({ loading: true });
      });

      connection.onreconnected(async (connectionId) => {
        console.log("Reconnected:", connectionId);
        toast.success("Reconnected!");
        set({ loading: false });
        try {
          await connection.invoke("JoinGame");
        } catch (err) {
          console.error("Failed to rejoin:", err);
        }
      });

      connection.onclose((error) => {
        console.error("Connection closed:", error);
        toast.error("Connection lost. Please refresh the page.");
        set({
          connection: null,
          loading: false,
          error: "Connection lost",
        });
      });

      await connection.start();
      console.log("✅ SignalR connected");
      await connection.invoke("JoinGame");
      set({ connection, loading: false });
    } catch (err) {
      toast.error("Failed to connect to game server");
      set({
        loading: false,
        error: "Failed to connect to game server",
      });
    }
  },

  disconnectFromGame: async () => {
    const { connection } = get();
    if (!connection) return;

    try {
      if (connection.state === signalR.HubConnectionState.Connected) {
        await connection.stop();
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      set({ connection: null, game: null });
    }
  },

  getGame: async () => {
    set({ loading: true });

    const data = await api.game.getGameData();

    set({
      game: data,
      loading: false,
    });

    if (data?.players[data.currentPlayerIndex]?.isPlayer === false) {
      await useGameStore.getState().botAction();
    }
  },

  playerAction: async (action: string, payload?: GameActionPayload) => {
    set({ loading: true });
    const {connection} = get();
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      toast.error("Not connected to game");
      return;
    }

    const state = useGameStore.getState();

    const data = await api.game.playerAction(action, payload);

    set({
      game: data,
      loading: false,
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
      loading: false,
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
      loading: false,
    });
  },
}));
