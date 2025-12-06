import { createContext, useContext } from "react";

export interface ContextData {
    token: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface AuthContextType {
    data: ContextData | null;
    loading: boolean;
    error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
    