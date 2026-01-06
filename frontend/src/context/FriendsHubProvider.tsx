import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuthContext } from "./AuthContext";
import { FriendsHubContext } from "./FriendsHubContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const FriendsHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useAuthContext();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!data?.token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${backendUrl}/hubs/friends`, {
        accessTokenFactory: () => data.token!,
      })
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => setConnection(connection));

    return () => {
      connection.stop();
      setConnection(null);
    };
  }, [data?.token]);

  return (
    <FriendsHubContext.Provider value={connection}>
      {children}
    </FriendsHubContext.Provider>
  );
};