import { createContext, useContext } from "react";
import * as signalR from "@microsoft/signalr";

export const FriendsHubContext = createContext<signalR.HubConnection | null>(null);

export const useFriendsHub = () => useContext(FriendsHubContext);