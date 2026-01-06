import { useEffect } from "react";
import { useFriendsHub } from "../context/FriendsHubContext";

export default function FriendInviteListener() {
  const connection = useFriendsHub();

  useEffect(() => {
    if (!connection) {
      console.log("No SignalR connection available in FriendInviteListener.");
      return;
    }

    const handler = (fromUsername: string) => {
      console.log("Received ReceiveFriendInvite event from:", fromUsername);
      alert(`Friend invite from ${fromUsername}`);
    };

    console.log("Registering ReceiveFriendInvite handler.");
    connection.on("ReceiveFriendInvite", handler);

    return () => {
      console.log("Unregistering ReceiveFriendInvite handler.");
      connection.off("ReceiveFriendInvite", handler);
    };
  }, [connection]);

  return null;
}