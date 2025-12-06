import { useEffect, useState } from "react";
import { AuthContext, type ContextData } from "./AuthContext";

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [data, setData] = useState<ContextData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {        
        async function load() {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); 
                setData({
                token: localStorage.getItem("token"),
                user: {
                    id: '42',
                    name: 'John Doe',
                    email: 'john.doe@gmail.com'
                }
                });
            } catch (err) {
                setError("Failed to load authentication data: " + (err as Error).message);
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
