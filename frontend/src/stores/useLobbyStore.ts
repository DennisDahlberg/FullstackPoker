import { create } from "zustand";
import * as signalR from "@microsoft/signalr";
import type { LobbyState } from "@/types/Lobby";
import { toast } from "sonner";

interface LobbyStore {
  lobby: LobbyState | null;
  connection: signalR.HubConnection | null;
  loading: boolean;
  error: string | null;
  gameStartedId: string | null;

  connectAndCreate: (tableId: number) => Promise<void>;
  disconnect: () => Promise<void>;
  addBot: (botId: number) => Promise<void>;
  removeBot: (botId: number) => Promise<void>;
  clearError: () => void;
  clearGameStarted: () => void;
  leaveLobby: () => Promise<void>;
  startGame: () => Promise<void>;
  invitePlayer: (friendId: string) => Promise<void>;
}

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  lobby: null,
  connection: null,
  loading: false,
  error: null,
  gameStartedId: null,

  clearError: () => set({ error: null }),
  clearGameStarted: () => set({ gameStartedId: null }),

  connectAndCreate: async (tableId: number) => {
    const existing = get().connection;
    if (existing && existing.state !== signalR.HubConnectionState.Disconnected) {
      try {
        await existing.invoke("CreateLobby", tableId);
      } catch (err) {
        console.error("Failed to create lobby:", err);
        set({ error: "Failed to create lobby" });
      }
      return;
    }

    set({ loading: true, error: null });

    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_BACKEND_URL}/hubs/lobby`, {
          accessTokenFactory: () => localStorage.getItem("token") ?? "",
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Listen for lobby events
      connection.on("LobbyCreated", (lobbyState: LobbyState) => {
        set({ lobby: lobbyState, loading: false });
      });

      connection.on("LobbyUpdated", (lobbyState: LobbyState) => {
        set({ lobby: lobbyState });
      });

      connection.on("GameStarted", (gameId: string) => {
        toast.success("Game starting!");
        set({ gameStartedId: gameId, loading: false });
      });

      connection.on("LobbyClosed", (message: string) => {
        toast.error(message);
        set({ lobby: null, connection: null, loading: false });
      });

      connection.on("PlayerLeft", (username: string) => {
        toast.info(`${username} left the lobby`);
      });

      connection.on("PlayerJoined", (username: string) => {
        toast.success(`${username} joined the lobby`);
      });

      connection.on("InviteSent", (username: string) => {
        toast.success(`Invite sent to ${username}`);
      });

      connection.on("Error", (message: string) => {
        set({ error: message, loading: false });
        toast.error(message);
      });

      connection.onreconnecting(() => {
        set({ loading: true });
        toast.info("Reconnecting to lobby...");
      });

      connection.onreconnected(() => {
        set({ loading: false });
        toast.success("Reconnected to lobby");
      });

      connection.onclose(() => {
        set({ connection: null, lobby: null, loading: false });
      });

      await connection.start();
      set({ connection });

      // Create lobby once connected
      await connection.invoke("CreateLobby", tableId);
    } catch (err) {
      console.error("Failed to connect to lobby hub:", err);
      set({ error: "Failed to connect to lobby", loading: false });
      toast.error("Failed to connect to lobby");
    }
  },

  disconnect: async () => {
    const { connection } = get();
    if (connection) {
      try {
        await connection.stop();
      } catch (err) {
        console.error("Error disconnecting from lobby:", err);
      }
    }
    set({ connection: null, lobby: null, loading: false, error: null });
  },

  addBot: async (botId: number) => {
    const { connection } = get();
    if (!connection) {
      toast.error("Not connected to lobby");
      return;
    }
    try {
      await connection.invoke("AddBotToLobby", botId);
    } catch (err) {
      console.error("Failed to add bot:", err);
      toast.error("Failed to add bot");
    }
  },

  removeBot: async (botId: number) => {
    const { connection } = get();
    if (!connection) {
      toast.error("Not connected to lobby");
      return;
    }
    try {
      await connection.invoke("RemoveBotFromLobby", botId);
    } catch (err) {
      console.error("Failed to remove bot:", err);
      toast.error("Failed to remove bot");
    }
  },

  leaveLobby: async () => {
    const { connection } = get();
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      set({ lobby: null, connection: null });
      return;
    }
    try {
      await connection.invoke("LeaveLobby");
      await connection.stop();
    } catch (err) {
      console.error("Failed to leave lobby:", err);
      await connection.stop();
    }
    set({ connection: null, lobby: null, loading: false, error: null });
  },

  startGame: async () => {
    const { connection } = get();
    if (
      !connection ||
      connection.state !== signalR.HubConnectionState.Connected
    ) {
      toast.error("Not connected to lobby");
      return;
    }
    try {
      set({ loading: true });
      await connection.invoke("StartGame");
    } catch (err: any) {
      console.error("Failed to start game:", err);
      toast.error(err.message || "Failed to start game");
      set({ loading: false });
    }
  },

  invitePlayer: async (friendId: string) => {
    const { connection } = get();
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      toast.error("Not connected to lobby");
      return;
    }
    try {
      await connection.invoke("InvitePlayer", friendId);
    } catch (err) {
      console.error("Failed to invite player:", err);
      toast.error("Failed to send invite");
    }
  },
}));
