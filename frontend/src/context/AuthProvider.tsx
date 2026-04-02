import { useEffect, useState } from "react";
import { AuthContext, type ContextData } from "./AuthContext";
import { api } from "@/lib/api";
import { User } from "lucide-react";

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [data, setData] = useState<ContextData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            const profile =  await api.auth.getProfile();
            setData({
                token: localStorage.getItem("token"),
                user: {
                    id: profile.id,
                    name: profile.username,
                    email: profile.email,
                    rank: profile.rank,
                    balance: profile.balance,
                    profileImageUrl: profile.profileImageUrl
                }                    
            });
            console.log(profile);
        } catch (err) {
            setError("Error fetching profile: " + (err as Error).message);
        }
    };

    useEffect(() => {        
        async function load() {
            const token = localStorage.getItem("token");
            const refreshToken = localStorage.getItem("refreshToken");
            if (!token && !refreshToken) {
                setLoading(false);
                return;
            }

            await refetch();
            setLoading(false);
        }

        load();        
    },[])

    const login = async (email: string, password: string) => {
        await api.auth.login(email, password);
        await refetch();
    }
    
   const register = async (email: string, username: string, password: string) => {
        await api.auth.register(email, username, password);
        await refetch();
    }

    const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setData(null);
    window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{data, loading, error, login, register, logout, refetch}}>
            {children}
        </AuthContext.Provider>
    )
}
