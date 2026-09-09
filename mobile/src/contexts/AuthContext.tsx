import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { router } from 'expo-router';
import {
    clearSession,
    getToken,
    getUser,
    setSession,
    type SessionUser,
} from '@/lib/session';
import api from '@/lib/api';

type AuthContextType = {
    user: SessionUser | null;
    loading: boolean;
    login: (token: string, user: SessionUser) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = await getToken();
        const userData = await getUser();
        setUser(token && userData ? userData : null);
        setLoading(false);
    };

    const login = async (token: string, userData: SessionUser) => {
        await setSession(token, userData);
        setUser(userData);
    };

    const logout = async () => {
        await clearSession();
        setUser(null);
        router.replace('/(auth)/otp-request');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// Keep the axios instance in scope so it can be exported for side-effects.
void api;
