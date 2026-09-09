import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'astrotalk_token';
const USER_KEY = 'astrotalk_user';

export type SessionUser = {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    role: 'customer' | 'astrologer' | 'admin';
};

export async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
        return null;
    }
}

export async function setSession(
    token: string,
    user: SessionUser,
): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<SessionUser | null> {
    try {
        const raw = await SecureStore.getItemAsync(USER_KEY);
        return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
        return null;
    }
}

export async function clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
    return (await getToken()) !== null;
}
