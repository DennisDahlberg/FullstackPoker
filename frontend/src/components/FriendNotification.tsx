import { useEffect } from "react";
import { useFriendsHub } from "../context/FriendsHubContext";
import { toast } from "sonner";

export default function FriendInviteListener() {
  const connection = useFriendsHub();

  useEffect(() => {
    if (!connection) {
      return;
    }

    const handler = (senderUsername: string) => {
      toast.info("New friend request", {
        description: `${senderUsername} sent you a friend request`,
      });
    };

    connection.on("ReceiveFriendInvite", handler);

    return () => {
      connection.off("ReceiveFriendInvite", handler);
    };
  }, [connection]);

  return null;
}