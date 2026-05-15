import type { ChatConversation, ChatMessage } from "@/types/Chat";
import type { HubConnection } from "@microsoft/signalr";
import { create } from "zustand/react";

interface ChatStore {
  connection: HubConnection | null;
  conversations: Map<string, ChatConversation>;
  activeChat: string | null;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (recipientId: string, message: string) => Promise<void>;
  setActiveChat: (friendId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  markAsRead: (friendId: string) => void;
  getTotalUnread: () => number;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  connection: null,
  conversations: new Map(),
  activeChat: null,

  connect: async () => {
    return new Promise<void>((resolve, reject) => {});
  },

  disconnect: async () => {
    return new Promise<void>((resolve, reject) => {});
  },

  sendMessage: async (recipientId: string, message: string) => {
    return new Promise<void>((resolve, reject) => {});
  },

  setActiveChat: (friendId: string | null) => {
    set({ activeChat: friendId });
  },

  addMessage: (message: ChatMessage) => {
    return;
  },

  markAsRead: (friendId: string) => {
    return;
  },

  getTotalUnread: () => {
    return 0;
  },
}));
