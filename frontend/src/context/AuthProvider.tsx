import { useEffect, useState } from "react";
import { AuthContext, type ContextData } from "./AuthContext";
import { api } from "@/lib/api";

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [data, setData] = useState<ContextData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {        
        async function load() {
            const token = localStorage.getItem("token");
            const refreshToken = localStorage.getItem("refreshToken");
            if (!token && !refreshToken) {
                setLoading(false);
                return;
            }

            try {
                const profile =  await api.auth.getProfile();
                console.log(profile);
                setData({
                    token: localStorage.getItem("token"),
                    user: {
                        id: profile.id,
                        name: profile.username,
                        email: profile.email,
                        rank: profile.rank
                    }
                });
            } catch (err) {
                setError("Error fetching profile: " + (err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        load();        
        
        
    },[])

    const login = async (email: string, password: string) => {
        await api.auth.login(email, password);
        const profile = await api.auth.getProfile();

        setData({
            token: localStorage.getItem("token"),
            user: {
                id: profile.id,
                name: profile.username,
                email: profile.email,
                rank: profile.rank
            }
        });
    }
    
   const register = async (email: string, password: string) => {
        await api.auth.register(email, password);
        const profile = await api.auth.getProfile();

        setData({
            token: localStorage.getItem("token"),
            user: {
                id: profile.id,
                name: profile.username,
                email: profile.email,
                rank: profile.rank
            }
        });
    }

    const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setData(null);
    window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{data, loading, error, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
