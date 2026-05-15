import { api } from "@/lib/api";
import type { ChatConversation, ChatMessage } from "@/types/Chat";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { create } from "zustand/react";

interface ChatStore {
  connection: HubConnection | null;
  conversations: Map<string, ChatConversation>;
  activeChat: string | null;
  isConnected: boolean;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (recipientId: string, message: string) => Promise<void>;
  setActiveChat: (friendId: string | null) => void;
  getOrCreateConversation: (
    friendId: string,
    friendUsername: string,
    friendProfileImageUrl: string,
    isOnline: boolean,
  ) => ChatConversation;
  markAsRead: (friendId: string) => void;
  getTotalUnread: () => number;
  loadMessages: (friendId: string) => Promise<ChatMessage[]>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  connection: null,
  conversations: new Map(),
  activeChat: null,
  isConnected: false,

  connect: async () => {
    const existing = get().connection;
    if (existing && existing.state !== HubConnectionState.Disconnected) {
      return;
    }

    try {
      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_BACKEND_URL}/hubs/chat`, {
          accessTokenFactory: () => localStorage.getItem("token") ?? "",
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.on(
        "ReceiveMessage",
        (data: {
          senderId: string;
          recipientId: string;
          senderUsername: string;
          senderProfileImageUrl: string;
          content: string;
          sentAt: string;
          isOwnMessage: boolean;
        }) => {
          const conversations = get().conversations;
          const friendId = data.isOwnMessage ? data.recipientId : data.senderId;

          let conversation = conversations.get(friendId);
          if (!conversation) {
            conversation = {
              friendId: friendId,
              friendUsername: data.senderUsername,
              friendProfileImageUrl: data.senderProfileImageUrl,
              isOnline: false,
              messages: [],
              unreadCount: 0,
            };
            conversations.set(friendId, conversation);
          }

          const message: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`, // Temporary ID until we have DB
            senderId: data.senderId,
            senderUsername: data.senderUsername,
            senderProfileImageUrl: data.senderProfileImageUrl,
            message: data.content,
            timestamp: data.sentAt,
            isOwnMessage: data.isOwnMessage,
          };

          conversation.messages.push(message);

          if (!data.isOwnMessage && get().activeChat !== friendId) {
            conversation.unreadCount++;
          }

          set({ conversations: new Map(conversations) });
        },
      );

      connection.on("Error", (error: string) => {
        console.error("Chat error:", error);
      });

      await connection.start();
      set({ connection, isConnected: true });
      console.log("Connected to ChatHub");
    } catch (err) {
      console.error("Failed to connect to ChatHub:", err);
      set({ isConnected: false });
    }
  },

  disconnect: async () => {
    const connection = get().connection;
    if (connection) {
      try {
        await connection.stop();
        set({ connection: null, isConnected: false });
        console.log("Disconnected from ChatHub");
      } catch (err) {
        console.error("Failed to disconnect from ChatHub:", err);
      }
    }
  },

  sendMessage: async (recipientId: string, content: string) => {
    const connection = get().connection;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      throw new Error("Not connected to chat");
    }

    try {
      await connection.invoke("SendMessage", recipientId, content);
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  },

  setActiveChat: (friendId: string | null) => {
    set({ activeChat: friendId });
  },

  getOrCreateConversation: (
    friendId: string,
    friendUsername: string,
    friendProfileImageUrl: string,
    isOnline: boolean,
  ) => {
    const conversations = get().conversations;
    let conversation = conversations.get(friendId);
    if (!conversation) {
      conversation = {
        friendId,
        friendUsername,
        friendProfileImageUrl,
        isOnline,
        messages: [],
        unreadCount: 0,
      };
      conversations.set(friendId, conversation);
      set({ conversations: new Map(conversations) });
    } else {
      conversation.isOnline = isOnline;
      set({ conversations: new Map(conversations) });
    }
    return conversation;
  },

  loadMessages: async (friendId: string) => {
    try {
      const messages = await api.chat.getMessages(friendId);

      const chatMessages: ChatMessage[] = messages.map((msg: any) => ({
        id: msg.id.toString(),
        senderId: msg.senderId,
        senderUsername: msg.senderUsername,
        senderProfileImageUrl: msg.senderProfileImageUrl,
        message: msg.content,
        timestamp: msg.sentAt,
        isOwnMessage: msg.isOwnMessage,
      }));

      const conversations = get().conversations;
      const conversation = conversations.get(friendId);
      if (conversation) {
        conversation.messages = chatMessages;
        set({ conversations: new Map(conversations) });
      }

      return chatMessages;
    } catch (err) {
      console.error("Failed to load messages:", err);
      throw err;
    }
  },

  markAsRead: (friendId: string) => {
    return;
  },

  getTotalUnread: () => {
    return 0;
  },
}));
