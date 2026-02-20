import { create } from "zustand";
import * as signalR from "@microsoft/signalr";
import type { GameSessionSummary, GameState } from "@/types/GameState";
import type { GameActionPayload } from "@/types/GameState";
import { toast } from "sonner";

interface GameStore {
  game: GameState | null;
  loading: boolean;
  animating: boolean;
  connection: signalR.HubConnection | null;
  error: string | null;
  sessionSummary: GameSessionSummary | null;

  connectToGame: () => Promise<void>;
  disconnectFromGame: () => Promise<void>;

  setAnimating: (v: boolean) => void;
  playerAction: (action: string, payload?: GameActionPayload) => Promise<void>;
  startNewRound: () => Promise<void>;
  leaveGame: () => Promise<void>;

  clearError: () => void;
  clearSessionSummary: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  loading: false,
  connection: null,
  error: null,
  animating: false,
  sessionSummary: null,

  setAnimating: (v) => set({ animating: v }),
  clearError: () => set({ error: null }),
  clearSessionSummary: () => set({ sessionSummary: null }),

  connectToGame: async () => {
    const existing = get().connection;
    if (
      existing &&
      existing.state !== signalR.HubConnectionState.Disconnected
    ) {
      return;
    }

    set({ loading: true, error: null, sessionSummary: null });

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

      connection.on("GameLeft", (data: any) => {
        toast.success(data.message);
        set({ game: null, connection: null });
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
        if (get().sessionSummary) return;
        console.error("Connection closed:", error);
        toast.error("Connection lost. Please refresh the page.");
        set({
          connection: null,
          loading: false,
          error: "Connection lost",
        });
      });

      await connection.start();
      console.log("SignalR connected");
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

  playerAction: async (action: string, payload?: GameActionPayload) => {
    set({ loading: true });
    const { connection } = get();
    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      toast.error("Not connected to game");
      return;
    }

    try {
      const amount = payload && "amount" in payload ? payload.amount : null;
      await connection.invoke("PlayerAction", action, amount);
    } catch (error: any) {
      console.error("Failed to send action:", error);
      toast.error(error.message || "Failed to perform action");
      set({ animating: false });
    }
  },

  startNewRound: async () => {
    const { connection } = get();
    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      toast.error("Not connected to game");
      return;
    }

    try {
      await connection.invoke("StartNewRound");
    } catch (error: any) {
      console.error("Failed to start new round:", error);
      toast.error(error.message || "Failed to start new round");
    }
  },

  leaveGame: async () => {
    const { connection } = get();

    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      set({ game: null });
      return;
    }

    try {
      await connection.invoke("LeaveGame");
    } catch (error: any) {
      console.error("Failed to leave game:", error);
      await connection.stop();
      set({ connection: null, game: null });
    }
  },
}));
