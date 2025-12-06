import { useEffect, useState } from "react";
import { AuthContext, type ContextData } from "./AuthContext";
import { api } from "@/lib/api";

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [data, setData] = useState<ContextData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {        
        async function load() {
            // try {
            //     await new Promise(resolve => setTimeout(resolve, 1000)); 
            //     setData({
            //     token: localStorage.getItem("token"),
            //     user: {
            //         id: '42',
            //         name: 'John Doe',
            //         email: 'john.doe@gmail.com',
            //         rank: 'Beginner'
            //     }
            //     });
            // } catch (err) {
            //     setError("Failed to load authentication data: " + (err as Error).message);
            // } finally {
            //     setLoading(false);
            // }
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

    return (
        <AuthContext.Provider value={{data, loading, error}}>
            {children}
        </AuthContext.Provider>
    )
}
