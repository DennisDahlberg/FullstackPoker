import { useEffect } from "react";
import { useFriendsHub } from "../context/FriendsHubContext";
import { toast } from "sonner";
import type { LobbyInvite } from "@/types/Lobby";
import { useChatStore } from "@/stores/useChatStore";

export default function FriendInviteListener() {
  const connection = useFriendsHub();
  const connectChat = useChatStore((state) => state.connect);

  useEffect(() => {
    connectChat();
  }, []);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const handleFriendRequest = (senderUsername: string) => {
      toast.info("New friend request", {
        description: `${senderUsername} sent you a friend request`,
      });
    };

    const handleGameRequest = (invite: LobbyInvite) => {
      toast.info("Game invite received!", {
        description: `${invite.hostUsername} invited you to join their lobby`,
      });
    };

    connection.on("ReceiveFriendInvite", handleFriendRequest);
    connection.on("LobbyInviteReceived", handleGameRequest);

    return () => {
      connection.off("ReceiveFriendInvite", handleFriendRequest);
      connection.off("LobbyInviteReceived", handleGameRequest);
    };
  }, [connection]);

  return null;
}
