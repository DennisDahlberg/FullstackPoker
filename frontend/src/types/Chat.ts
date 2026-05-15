export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderProfileImageUrl: string;
  message: string;
  timestamp: string;
  isOwnMessage: boolean;
}

export interface ChatConversation {
  friendId: string;
  friendUsername: string;
  friendProfileImageUrl: string;
  isOnline: boolean;
  messages: ChatMessage[];
  unreadCount: number;
}