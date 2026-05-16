import { api } from "@/lib/api";
import type { ChatConversation, ChatMessage } from "@/types/Chat";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { create } from "zustand";

interface ChatStore {
  connection: HubConnection | null;
  conversations: Map<string, ChatConversation>;
  activeChat: string | null;
  isConnected: boolean;
  isConnecting: boolean;

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
  markAsRead: (friendId: string) => Promise<void>;
  getTotalUnread: () => number;
  loadMessages: (friendId: string) => Promise<ChatMessage[]>;
  loadConversations: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  connection: null,
  conversations: new Map(),
  activeChat: null,
  isConnected: false,
  isConnecting: false,

  connect: async () => {
    const existing = get().connection;
    const isConnecting = get().isConnecting;

    if (isConnecting) {
      console.log("Already connecting to ChatHub...");
      return;
    }

    if (existing && existing.state !== HubConnectionState.Disconnected) {
      return;
    }

    set({ isConnecting: true });

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

          const updatedConversation = {
            ...conversation,
            messages: [...conversation.messages, message],
            unreadCount:
              !data.isOwnMessage && get().activeChat !== friendId
                ? conversation.unreadCount + 1
                : conversation.unreadCount,
          };

          conversations.set(friendId, updatedConversation);
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
  if (friendId) {
    const conversations = get().conversations;
    const conversation = conversations.get(friendId);
    
    if (conversation && conversation.unreadCount > 0) {
      // Update both activeChat AND unreadCount in ONE set() call
      const updatedConversation = {
        ...conversation,
        unreadCount: 0,
      };
      const newConversations = new Map(conversations);
      newConversations.set(friendId, updatedConversation);
      
      set({ 
        activeChat: friendId,
        conversations: newConversations 
      });
      
      // Mark as read on backend (async, but UI already updated)
      api.chat.markAsRead(friendId).catch(err => {
        console.error("Failed to mark messages as read:", err);
      });
    } else {
      // No unread messages, just set active chat
      set({ activeChat: friendId });
    }
  } else {
    set({ activeChat: null });
  }
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
    const newConversations = new Map(conversations);
    newConversations.set(friendId, conversation);
    set({ conversations: newConversations });
  } else if (conversation.isOnline !== isOnline) {
    const updatedConversation = {
      ...conversation,
      isOnline,
    };
    const newConversations = new Map(conversations);
    newConversations.set(friendId, updatedConversation);
    set({ conversations: newConversations });
    conversation = updatedConversation;
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
        const updatedConversation = {
          ...conversation,
          messages: chatMessages,
        };
        const newConversations = new Map(conversations);
        newConversations.set(friendId, updatedConversation);
        set({ conversations: newConversations });
      }

      return chatMessages;
    } catch (err) {
      console.error("Failed to load messages:", err);
      throw err;
    }
  },

  loadConversations: async () => {
    try {
      const conversationsData = await api.chat.getConversations();

      const conversations = new Map<string, ChatConversation>();

      for (const conv of conversationsData) {
        const messages = await api.chat.getMessages(conv.friendId);

        const chatMessages: ChatMessage[] = messages.map((msg: any) => ({
          id: msg.id.toString(),
          senderId: msg.senderId,
          senderUsername: msg.senderUsername,
          senderProfileImageUrl: msg.senderProfileImageUrl,
          message: msg.content,
          timestamp: msg.sentAt,
          isOwnMessage: msg.isOwnMessage,
        }));

        const activeChat = get().activeChat;
        const unreadCount = conv.friendId === activeChat ? 0 : conv.unreadCount;

        conversations.set(conv.friendId, {
          friendId: conv.friendId,
          friendUsername: conv.friendUsername,
          friendProfileImageUrl: conv.friendProfileImageUrl,
          isOnline: conv.isOnline,
          messages: chatMessages,
          unreadCount,
        });
      }

      set({ conversations });

      window.dispatchEvent(new Event("refreshChatNotifications"));
    } catch (err) {
      console.error("Failed to load conversations:", err);
      throw err;
    }
  },

  markAsRead: async (friendId: string) => {
    const conversations = get().conversations;
    const conversation = conversations.get(friendId);
    if (conversation && conversation.unreadCount > 0) {
      const updatedConversation = {
        ...conversation,
        unreadCount: 0,
      };

      const newConversations = new Map(conversations);
      newConversations.set(friendId, updatedConversation);
      set({ conversations: newConversations });

      try {
        await api.chat.markAsRead(friendId);
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    }
  },

  getTotalUnread: () => {
    const conversations = get().conversations;
    let totalUnread = 0;
    conversations.forEach((conversation) => {
      totalUnread += conversation.unreadCount;
    });
    return totalUnread;
  },
}));
