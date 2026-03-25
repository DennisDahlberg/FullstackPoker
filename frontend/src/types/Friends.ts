export interface Friend {
  id: string;
  username: string;
  isOnline: boolean;
}

export interface FriendRequest {
  id: number;
  username: string;
  sentAt: string;
}

export interface User {
  id: string;
  username: string;
  status: "none" | "friend" | "pending" | "requested";
}

export type TabId = "friends" | "requests" | "find" | "invites";