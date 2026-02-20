import { createContext, useContext } from "react";

export interface ContextData {
    token: string | null;
    user: {
        id: string;
        name: string;
        email: string;
        rank: string;
        balance?: number;
    } | null;
}

export interface AuthContextType {
    data: ContextData | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
    