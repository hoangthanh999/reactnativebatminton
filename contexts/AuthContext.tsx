// contexts/AuthContext.tsx
import { getCurrentUser, getToken } from '@/services/authService';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            console.log('🔄 AuthContext: Checking auth...');
            const token = await getToken();
            console.log('🔑 AuthContext: Token exists:', !!token);

            if (token) {
                const userData = await getCurrentUser();
                console.log('👤 AuthContext: User data:', userData);
                setUser(userData);
            } else {
                console.log('❌ AuthContext: No token found');
                setUser(null);
            }
        } catch (error) {
            console.error('❌ AuthContext: Check error:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
            console.log('✅ AuthContext: Check complete');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData: User) => {
        console.log('✅ AuthContext: Login called with:', userData);
        setUser(userData);
    };

    const logout = () => {
        console.log('🚪 AuthContext: Logout called');
        setUser(null);
    };

    const refreshAuth = async () => {
        console.log('🔄 AuthContext: Refresh auth called');
        await checkAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
